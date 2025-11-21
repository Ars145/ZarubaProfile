import { 
  users,
  players,
  clans,
  clanMembers,
  clanApplications,
} from "@shared/schema.js";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;
import { eq, and } from "drizzle-orm";

const databaseUrl = process.env.DATABASE_URL;
const poolUrl = databaseUrl.replace('.us-east-2', '-pooler.us-east-2');
const pool = new Pool({
  connectionString: poolUrl,
  max: 10,
});
const db = drizzle(pool);

export class PostgresStorage {
  // === USERS (legacy) ===
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // === PLAYERS ===
  async getPlayerBySteamId(steamId) {
    const [player] = await db.select().from(players).where(eq(players.steamId, steamId));
    return player;
  }

  async upsertPlayer(data) {
    const [player] = await db
      .insert(players)
      .values(data)
      .onConflictDoUpdate({
        target: players.steamId,
        set: { username: data.username, discordId: data.discordId },
      })
      .returning();
    return player;
  }

  async updatePlayerClan(playerId, clanId) {
    await db.update(players).set({ currentClanId: clanId }).where(eq(players.id, playerId));
  }
  
  // === CLANS ===
  async listClans() {
    return await db.select().from(clans);
  }

  async getClanById(clanId) {
    const [clan] = await db.select().from(clans).where(eq(clans.id, clanId));
    return clan;
  }

  async getClanByTag(tag) {
    const [clan] = await db.select().from(clans).where(eq(clans.tag, tag));
    return clan;
  }

  async createClan(data, ownerId) {
    const owner = await this.getPlayerBySteamId(ownerId);
    if (!owner) {
      const [ownerById] = await db.select().from(players).where(eq(players.id, ownerId));
      if (!ownerById) {
        throw new Error("Owner player not found");
      }
    }

    return await db.transaction(async (tx) => {
      const [clan] = await tx.insert(clans).values(data).returning();
      
      await tx.insert(clanMembers).values({
        clanId: clan.id,
        playerId: owner?.id || ownerId,
        role: "owner",
      });
      
      await tx.update(players).set({ currentClanId: clan.id }).where(eq(players.id, owner?.id || ownerId));
      
      return clan;
    });
  }

  async updateClanSettings(clanId, data) {
    const [clan] = await db
      .update(clans)
      .set(data)
      .where(eq(clans.id, clanId))
      .returning();
    return clan;
  }

  async deleteClan(clanId) {
    await db.delete(clans).where(eq(clans.id, clanId));
  }
  
  // === CLAN MEMBERS ===
  async getClanMembers(clanId) {
    const members = await db
      .select()
      .from(clanMembers)
      .leftJoin(players, eq(clanMembers.playerId, players.id))
      .where(eq(clanMembers.clanId, clanId));
    
    return members.map(row => ({
      ...row.clan_members,
      player: row.players,
    }));
  }

  async getClanMemberByPlayer(clanId, playerId) {
    const [member] = await db
      .select()
      .from(clanMembers)
      .where(and(eq(clanMembers.clanId, clanId), eq(clanMembers.playerId, playerId)));
    return member;
  }

  async addClanMember(data) {
    const [player] = await db.select().from(players).where(eq(players.id, data.playerId));
    if (!player) {
      throw new Error("Player not found");
    }

    const existingMember = await this.getClanMemberByPlayer(data.clanId, data.playerId);
    if (existingMember) {
      throw new Error("Player is already a clan member");
    }

    return await db.transaction(async (tx) => {
      const [member] = await tx.insert(clanMembers).values(data).returning();
      await tx.update(players).set({ currentClanId: data.clanId }).where(eq(players.id, data.playerId));
      return member;
    });
  }

  async updateMemberRole(memberId, role) {
    const [member] = await db
      .update(clanMembers)
      .set({ role })
      .where(eq(clanMembers.id, memberId))
      .returning();
    return member;
  }

  async removeClanMember(memberId) {
    const [member] = await db.select().from(clanMembers).where(eq(clanMembers.id, memberId));
    if (!member) {
      throw new Error("Clan member not found");
    }

    await db.transaction(async (tx) => {
      await tx.update(players).set({ currentClanId: null }).where(eq(players.id, member.playerId));
      await tx.delete(clanMembers).where(eq(clanMembers.id, memberId));
    });
  }
  
  // === APPLICATIONS ===
  async listApplicationsByClan(clanId, status) {
    if (status) {
      return await db
        .select()
        .from(clanApplications)
        .where(and(eq(clanApplications.clanId, clanId), eq(clanApplications.status, status)));
    }
    return await db.select().from(clanApplications).where(eq(clanApplications.clanId, clanId));
  }

  async getApplicationById(applicationId) {
    const [application] = await db
      .select()
      .from(clanApplications)
      .where(eq(clanApplications.id, applicationId));
    return application;
  }

  async createApplication(data) {
    const [application] = await db.insert(clanApplications).values(data).returning();
    return application;
  }

  async approveApplication(applicationId) {
    const application = await this.getApplicationById(applicationId);
    if (!application) {
      throw new Error("Application not found");
    }

    if (application.status !== "pending") {
      throw new Error("Application is not pending");
    }

    return await db.transaction(async (tx) => {
      let player = await this.getPlayerBySteamId(application.playerSteamId);
      if (!player) {
        const [newPlayer] = await tx
          .insert(players)
          .values({
            steamId: application.playerSteamId,
            username: application.playerName,
          })
          .onConflictDoUpdate({
            target: players.steamId,
            set: { username: application.playerName },
          })
          .returning();
        player = newPlayer;
      }

      const [existingMember] = await tx
        .select()
        .from(clanMembers)
        .where(and(eq(clanMembers.clanId, application.clanId), eq(clanMembers.playerId, player.id)));
      
      if (existingMember) {
        throw new Error("Player is already a clan member");
      }

      const [updatedApplication] = await tx
        .update(clanApplications)
        .set({ status: "accepted" })
        .where(eq(clanApplications.id, applicationId))
        .returning();

      const [member] = await tx
        .insert(clanMembers)
        .values({
          clanId: application.clanId,
          playerId: player.id,
          role: "member",
          statsSnapshot: application.statsSnapshot,
        })
        .returning();

      await tx.update(players).set({ currentClanId: application.clanId }).where(eq(players.id, player.id));

      return { application: updatedApplication, member };
    });
  }

  async rejectApplication(applicationId) {
    const [application] = await db
      .update(clanApplications)
      .set({ status: "rejected" })
      .where(eq(clanApplications.id, applicationId))
      .returning();
    return application;
  }
}

export const storage = new PostgresStorage();
