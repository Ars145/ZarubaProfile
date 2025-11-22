import {
  users,
  players,
  clans,
  clanMembers,
  clanApplications,
} from "../shared/schema.js";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;
import { eq, and } from "drizzle-orm";

let db = null;
let pool = null;

const databaseUrl = process.env.DATABASE_URL;
if (databaseUrl) {
  try {
    const poolUrl = databaseUrl.replace('.us-east-2', '-pooler.us-east-2');
    pool = new Pool({
      connectionString: poolUrl,
      max: 10,
    });
    db = drizzle(pool);
    console.log('✓ PostgreSQL configured');
  } catch (err) {
    console.error('✗ Failed to configure PostgreSQL:', err.message);
  }
} else {
  console.warn('⚠️  DATABASE_URL not set, using in-memory storage');
}

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

// In-memory storage для разработки без БД
class MemStorage {
  constructor() {
    this.users = new Map();
    this.players = new Map();
    this.clans = new Map();
    this.clanMembers = new Map();
    this.clanApplications = new Map();
  }

  // === USERS ===
  async getUser(id) {
    return this.users.get(id);
  }

  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(u => u.username === username);
  }

  async createUser(insertUser) {
    const user = { ...insertUser, id: randomUUID() };
    this.users.set(user.id, user);
    return user;
  }

  // === PLAYERS ===
  async getPlayerBySteamId(steamId) {
    return Array.from(this.players.values()).find(p => p.steamId === steamId);
  }

  async upsertPlayer(data) {
    const existing = await this.getPlayerBySteamId(data.steamId);
    if (existing) {
      const updated = { ...existing, ...data };
      this.players.set(existing.id, updated);
      return updated;
    }
    const player = { ...data, id: randomUUID(), currentClanId: null };
    this.players.set(player.id, player);
    return player;
  }

  async updatePlayerClan(playerId, clanId) {
    const player = this.players.get(playerId);
    if (player) {
      player.currentClanId = clanId;
    }
  }

  // === CLANS ===
  async listClans() {
    return Array.from(this.clans.values());
  }

  async getClanById(clanId) {
    return this.clans.get(clanId);
  }

  async getClanByTag(tag) {
    return Array.from(this.clans.values()).find(c => c.tag === tag);
  }

  async createClan(data, ownerId) {
    let owner = await this.getPlayerBySteamId(ownerId);
    if (!owner) {
      owner = Array.from(this.players.values()).find(p => p.id === ownerId);
    }
    if (!owner) {
      throw new Error("Owner player not found");
    }

    const clan = { ...data, id: randomUUID(), createdAt: new Date() };
    this.clans.set(clan.id, clan);

    const member = {
      id: randomUUID(),
      clanId: clan.id,
      playerId: owner.id,
      role: "owner",
      statsSnapshot: null,
      joinedAt: new Date(),
    };
    this.clanMembers.set(member.id, member);

    owner.currentClanId = clan.id;
    return clan;
  }

  async updateClanSettings(clanId, data) {
    const clan = this.clans.get(clanId);
    if (!clan) throw new Error("Clan not found");
    Object.assign(clan, data);
    return clan;
  }

  async deleteClan(clanId) {
    this.clans.delete(clanId);
    Array.from(this.clanMembers.entries())
      .filter(([_, m]) => m.clanId === clanId)
      .forEach(([id]) => this.clanMembers.delete(id));
  }

  // === CLAN MEMBERS ===
  async getClanMembers(clanId) {
    return Array.from(this.clanMembers.values())
      .filter(m => m.clanId === clanId)
      .map(member => ({
        ...member,
        player: this.players.get(member.playerId),
      }));
  }

  async getClanMemberByPlayer(clanId, playerId) {
    return Array.from(this.clanMembers.values()).find(
      m => m.clanId === clanId && m.playerId === playerId
    );
  }

  async addClanMember(data) {
    const player = this.players.get(data.playerId);
    if (!player) throw new Error("Player not found");

    const existing = await this.getClanMemberByPlayer(data.clanId, data.playerId);
    if (existing) throw new Error("Player is already a clan member");

    const member = { ...data, id: randomUUID(), joinedAt: new Date() };
    this.clanMembers.set(member.id, member);
    player.currentClanId = data.clanId;
    return member;
  }

  async updateMemberRole(memberId, role) {
    const member = this.clanMembers.get(memberId);
    if (!member) throw new Error("Member not found");
    member.role = role;
    return member;
  }

  async removeClanMember(memberId) {
    const member = this.clanMembers.get(memberId);
    if (!member) throw new Error("Clan member not found");

    const player = this.players.get(member.playerId);
    if (player) {
      player.currentClanId = null;
    }
    this.clanMembers.delete(memberId);
  }

  // === APPLICATIONS ===
  async listApplicationsByClan(clanId, status) {
    let apps = Array.from(this.clanApplications.values()).filter(a => a.clanId === clanId);
    if (status) {
      apps = apps.filter(a => a.status === status);
    }
    return apps;
  }

  async getApplicationById(applicationId) {
    return this.clanApplications.get(applicationId);
  }

  async createApplication(data) {
    const application = {
      ...data,
      id: randomUUID(),
      status: "pending",
      createdAt: new Date(),
    };
    this.clanApplications.set(application.id, application);
    return application;
  }

  async approveApplication(applicationId) {
    const application = this.clanApplications.get(applicationId);
    if (!application) throw new Error("Application not found");
    if (application.status !== "pending") throw new Error("Application is not pending");

    let player = await this.getPlayerBySteamId(application.playerSteamId);
    if (!player) {
      player = {
        id: randomUUID(),
        steamId: application.playerSteamId,
        username: application.playerName,
        discordId: null,
        currentClanId: application.clanId,
      };
      this.players.set(player.id, player);
    }

    const existing = await this.getClanMemberByPlayer(application.clanId, player.id);
    if (existing) throw new Error("Player is already a clan member");

    application.status = "accepted";

    const member = {
      id: randomUUID(),
      clanId: application.clanId,
      playerId: player.id,
      role: "member",
      statsSnapshot: application.statsSnapshot,
      joinedAt: new Date(),
    };
    this.clanMembers.set(member.id, member);
    player.currentClanId = application.clanId;

    return { application, member };
  }

  async rejectApplication(applicationId) {
    const application = this.clanApplications.get(applicationId);
    if (!application) throw new Error("Application not found");
    application.status = "rejected";
    return application;
  }
}

// Выбор storage в зависимости от наличия БД
export const storage = db ? new PostgresStorage() : new MemStorage();
