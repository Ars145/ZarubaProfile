import { sql } from "drizzle-orm";
import { pgTable, text, varchar, uuid, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// === CLANS SYSTEM ===

// Players table - игроки с привязкой к Steam и Discord
export const players = pgTable("players", {
  id: uuid("id").primaryKey().defaultRandom(),
  steamId: text("steam_id").notNull().unique(),
  username: text("username").notNull(),
  discordId: text("discord_id"),
  currentClanId: uuid("current_clan_id").references(() => clans.id),
});

// Clans table - кланы с настройками
export const clans = pgTable("clans", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  tag: text("tag").notNull().unique(),
  description: text("description").notNull(),
  theme: text("theme").notNull().default("orange"),
  bannerUrl: text("banner_url"),
  logoUrl: text("logo_url"),
  requirements: jsonb("requirements").notNull().default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

// Clan members table - члены кланов
export const clanMembers = pgTable("clan_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  clanId: uuid("clan_id").notNull().references(() => clans.id, { onDelete: "cascade" }),
  playerId: uuid("player_id").notNull().references(() => players.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  statsSnapshot: jsonb("stats_snapshot"),
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Clan applications table - заявки на вступление
export const clanApplications = pgTable("clan_applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  clanId: uuid("clan_id").notNull().references(() => clans.id, { onDelete: "cascade" }),
  playerName: text("player_name").notNull(),
  playerSteamId: text("player_steam_id").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("pending"),
  statsSnapshot: jsonb("stats_snapshot").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// === ZOD VALIDATION SCHEMAS ===

// Clan requirements schema
export const clanRequirementsSchema = z.object({
  microphone: z.boolean().default(false),
  ageRestriction: z.boolean().default(false),
  customRequirement: z.string().max(30).default(""),
});

// Stats snapshot schema (for applications and members)
export const statsSnapshotSchema = z.object({
  games: z.number().optional(),
  hours: z.string().optional(),
  sl: z.string().optional(),
  driver: z.string().optional(),
  pilot: z.string().optional(),
  cmd: z.string().optional(),
  likes: z.number().optional(),
  tk: z.number().optional(),
  winrate: z.number().optional(),
  kills: z.number().optional(),
  deaths: z.number().optional(),
  kd: z.number().optional(),
  wins: z.number().optional(),
  avgKills: z.number().optional(),
  vehicleKills: z.number().optional(),
  knifeKills: z.number().optional(),
}).passthrough();

// Player schemas
export const insertPlayerSchema = createInsertSchema(players, {
  steamId: z.string().min(1),
  username: z.string().min(1),
  discordId: z.string().optional(),
}).omit({ id: true, currentClanId: true });

export const upsertPlayerSchema = z.object({
  steamId: z.string().min(1),
  username: z.string().min(1),
  discordId: z.string().optional(),
});

// Clan schemas
export const insertClanSchema = createInsertSchema(clans, {
  name: z.string().min(1),
  tag: z.string().min(1).max(10),
  description: z.string().min(1),
  theme: z.enum(["orange", "blue", "yellow"]),
  requirements: clanRequirementsSchema,
}).omit({ id: true, createdAt: true });

export const updateClanSettingsSchema = z.object({
  theme: z.enum(["orange", "blue", "yellow"]).optional(),
  requirements: clanRequirementsSchema.optional(),
  description: z.string().min(1).optional(),
  bannerUrl: z.string().optional(),
  logoUrl: z.string().optional(),
});

// Clan member schemas
export const insertClanMemberSchema = createInsertSchema(clanMembers, {
  role: z.enum(["owner", "member"]),
  statsSnapshot: statsSnapshotSchema.optional(),
}).omit({ id: true, joinedAt: true });

export const updateMemberRoleSchema = z.object({
  role: z.enum(["owner", "member"]),
});

// Clan application schemas
export const insertClanApplicationSchema = createInsertSchema(clanApplications, {
  message: z.string().min(1).max(500),
  statsSnapshot: statsSnapshotSchema,
}).omit({ id: true, createdAt: true, status: true });

export const applicationActionSchema = z.object({
  action: z.enum(["approve", "reject"]),
});

// === TYPE EXPORTS ===

export type Player = typeof players.$inferSelect;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type UpsertPlayer = z.infer<typeof upsertPlayerSchema>;

export type Clan = typeof clans.$inferSelect;
export type InsertClan = z.infer<typeof insertClanSchema>;
export type UpdateClanSettings = z.infer<typeof updateClanSettingsSchema>;

export type ClanMember = typeof clanMembers.$inferSelect;
export type InsertClanMember = z.infer<typeof insertClanMemberSchema>;

export type ClanApplication = typeof clanApplications.$inferSelect;
export type InsertClanApplication = z.infer<typeof insertClanApplicationSchema>;
