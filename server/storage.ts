import { 
  type User, 
  type InsertUser,
  type Player,
  type InsertPlayer,
  type UpsertPlayer,
  type Clan,
  type InsertClan,
  type UpdateClanSettings,
  type ClanMember,
  type InsertClanMember,
  type ClanApplication,
  type InsertClanApplication,
  users,
  players,
  clans,
  clanMembers,
  clanApplications,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;
import { eq, and } from "drizzle-orm";

const databaseUrl = process.env.DATABASE_URL!;
const poolUrl = databaseUrl.replace('.us-east-2', '-pooler.us-east-2');
const pool = new Pool({
  connectionString: poolUrl,
  max: 10,
});
const db = drizzle(pool);

export interface IStorage {
  // === USERS (legacy) ===
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // === PLAYERS ===
  getPlayerBySteamId(steamId: string): Promise<Player | undefined>;
  upsertPlayer(data: UpsertPlayer): Promise<Player>;
  updatePlayerClan(playerId: string, clanId: string | null): Promise<void>;
  
  // === CLANS ===
  listClans(): Promise<Clan[]>;
  getClanById(clanId: string): Promise<Clan | undefined>;
  getClanByTag(tag: string): Promise<Clan | undefined>;
  createClan(data: InsertClan, ownerId: string): Promise<Clan>;
  updateClanSettings(clanId: string, data: UpdateClanSettings): Promise<Clan>;
  deleteClan(clanId: string): Promise<void>;
  
  // === CLAN MEMBERS ===
  getClanMembers(clanId: string): Promise<(ClanMember & { player: Player })[]>;
  getClanMemberByPlayer(clanId: string, playerId: string): Promise<ClanMember | undefined>;
  addClanMember(data: InsertClanMember): Promise<ClanMember>;
  updateMemberRole(memberId: string, role: "owner" | "member"): Promise<ClanMember>;
  removeClanMember(memberId: string): Promise<void>;
  
  // === APPLICATIONS ===
  listApplicationsByClan(clanId: string, status?: "pending" | "accepted" | "rejected"): Promise<ClanApplication[]>;
  getApplicationById(applicationId: string): Promise<ClanApplication | undefined>;
  createApplication(data: InsertClanApplication): Promise<ClanApplication>;
  approveApplication(applicationId: string): Promise<{ application: ClanApplication; member: ClanMember }>;
  rejectApplication(applicationId: string): Promise<ClanApplication>;
}

export class PostgresStorage implements IStorage {
  // === USERS (legacy) ===
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // === PLAYERS ===
  async getPlayerBySteamId(steamId: string): Promise<Player | undefined> {
    const [player] = await db.select().from(players).where(eq(players.steamId, steamId));
    return player;
  }

  async upsertPlayer(data: UpsertPlayer): Promise<Player> {
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

  async updatePlayerClan(playerId: string, clanId: string | null): Promise<void> {
    await db.update(players).set({ currentClanId: clanId }).where(eq(players.id, playerId));
  }
  
  // === CLANS ===
  async listClans(): Promise<Clan[]> {
    return await db.select().from(clans);
  }

  async getClanById(clanId: string): Promise<Clan | undefined> {
    const [clan] = await db.select().from(clans).where(eq(clans.id, clanId));
    return clan;
  }

  async getClanByTag(tag: string): Promise<Clan | undefined> {
    const [clan] = await db.select().from(clans).where(eq(clans.tag, tag));
    return clan;
  }

  async createClan(data: InsertClan, ownerId: string): Promise<Clan> {
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

  async updateClanSettings(clanId: string, data: UpdateClanSettings): Promise<Clan> {
    const [clan] = await db
      .update(clans)
      .set(data)
      .where(eq(clans.id, clanId))
      .returning();
    return clan;
  }

  async deleteClan(clanId: string): Promise<void> {
    await db.delete(clans).where(eq(clans.id, clanId));
  }
  
  // === CLAN MEMBERS ===
  async getClanMembers(clanId: string): Promise<(ClanMember & { player: Player })[]> {
    const members = await db
      .select()
      .from(clanMembers)
      .leftJoin(players, eq(clanMembers.playerId, players.id))
      .where(eq(clanMembers.clanId, clanId));
    
    return members.map(row => ({
      ...row.clan_members,
      player: row.players!,
    }));
  }

  async getClanMemberByPlayer(clanId: string, playerId: string): Promise<ClanMember | undefined> {
    const [member] = await db
      .select()
      .from(clanMembers)
      .where(and(eq(clanMembers.clanId, clanId), eq(clanMembers.playerId, playerId)));
    return member;
  }

  async addClanMember(data: InsertClanMember): Promise<ClanMember> {
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

  async updateMemberRole(memberId: string, role: "owner" | "member"): Promise<ClanMember> {
    const [member] = await db
      .update(clanMembers)
      .set({ role })
      .where(eq(clanMembers.id, memberId))
      .returning();
    return member;
  }

  async removeClanMember(memberId: string): Promise<void> {
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
  async listApplicationsByClan(clanId: string, status?: "pending" | "accepted" | "rejected"): Promise<ClanApplication[]> {
    if (status) {
      return await db
        .select()
        .from(clanApplications)
        .where(and(eq(clanApplications.clanId, clanId), eq(clanApplications.status, status)));
    }
    return await db.select().from(clanApplications).where(eq(clanApplications.clanId, clanId));
  }

  async getApplicationById(applicationId: string): Promise<ClanApplication | undefined> {
    const [application] = await db
      .select()
      .from(clanApplications)
      .where(eq(clanApplications.id, applicationId));
    return application;
  }

  async createApplication(data: InsertClanApplication): Promise<ClanApplication> {
    const [application] = await db.insert(clanApplications).values(data).returning();
    return application;
  }

  async approveApplication(applicationId: string): Promise<{ application: ClanApplication; member: ClanMember }> {
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
          statsSnapshot: application.statsSnapshot as any,
        })
        .returning();

      await tx.update(players).set({ currentClanId: application.clanId }).where(eq(players.id, player.id));

      return { application: updatedApplication, member };
    });
  }

  async rejectApplication(applicationId: string): Promise<ClanApplication> {
    const [application] = await db
      .update(clanApplications)
      .set({ status: "rejected" })
      .where(eq(clanApplications.id, applicationId))
      .returning();
    return application;
  }
}

export const storage = new PostgresStorage();
