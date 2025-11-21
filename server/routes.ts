import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { squadStatsService } from "./services/squadStats";
import { 
  insertClanSchema, 
  updateClanSettingsSchema,
  insertClanApplicationSchema,
  insertClanMemberSchema,
  upsertPlayerSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // === PLAYERS ===
  
  app.post("/api/players", async (req, res) => {
    try {
      const data = upsertPlayerSchema.parse(req.body);
      const player = await storage.upsertPlayer(data);
      res.status(201).json(player);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/players/:steamId", async (req, res) => {
    try {
      const player = await storage.getPlayerBySteamId(req.params.steamId);
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }
      res.json(player);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // === CLANS ===
  
  app.get("/api/clans", async (req, res) => {
    try {
      const clans = await storage.listClans();
      res.json(clans);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/clans/:id", async (req, res) => {
    try {
      const clan = await storage.getClanById(req.params.id);
      if (!clan) {
        return res.status(404).json({ error: "Clan not found" });
      }
      res.json(clan);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/clans", async (req, res) => {
    try {
      const data = insertClanSchema.parse(req.body);
      const { ownerId } = req.body;
      
      if (!ownerId) {
        return res.status(400).json({ error: "ownerId is required" });
      }

      const existingClan = await storage.getClanByTag(data.tag);
      if (existingClan) {
        return res.status(409).json({ error: "Clan with this tag already exists" });
      }

      const clan = await storage.createClan(data, ownerId);
      res.status(201).json(clan);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/clans/:id", async (req, res) => {
    try {
      const data = updateClanSettingsSchema.parse(req.body);
      const clan = await storage.updateClanSettings(req.params.id, data);
      res.json(clan);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/clans/:id", async (req, res) => {
    try {
      await storage.deleteClan(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // === CLAN MEMBERS ===

  app.get("/api/clans/:id/members", async (req, res) => {
    try {
      const members = await storage.getClanMembers(req.params.id);
      res.json(members);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/clans/:id/members", async (req, res) => {
    try {
      const data = insertClanMemberSchema.parse({
        ...req.body,
        clanId: req.params.id,
      });
      const member = await storage.addClanMember(data);
      res.status(201).json(member);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/clans/:clanId/members/:memberId", async (req, res) => {
    try {
      await storage.removeClanMember(req.params.memberId);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // === APPLICATIONS ===

  app.get("/api/clans/:id/applications", async (req, res) => {
    try {
      const { status } = req.query;
      const applications = await storage.listApplicationsByClan(
        req.params.id,
        status as any
      );
      res.json(applications);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/clans/:id/applications", async (req, res) => {
    try {
      const steamId = req.body.playerSteamId;
      const stats = await squadStatsService.getPlayerStats(steamId);
      
      if (!stats) {
        return res.status(404).json({ error: "Player stats not found" });
      }

      const data = insertClanApplicationSchema.parse({
        ...req.body,
        clanId: req.params.id,
        playerName: stats.name,
        statsSnapshot: {
          games: stats.matches?.matches,
          hours: stats.playtime,
          sl: stats.squadLeaderTime,
          driver: stats.vehicleTime?.heavy,
          heli: stats.vehicleTime?.heli,
          kills: stats.kills,
          death: stats.deaths,
          kd: stats.kd,
          revives: stats.revives,
          teamkills: stats.teamkills,
          winrate: stats.matches?.winrate,
          vehicleKills: stats.vehicleKills,
          knifeKills: stats.knifeKills,
        },
      });

      const application = await storage.createApplication(data);
      res.status(201).json(application);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/applications/:id/approve", async (req, res) => {
    try {
      const result = await storage.approveApplication(req.params.id);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/applications/:id/reject", async (req, res) => {
    try {
      const application = await storage.rejectApplication(req.params.id);
      res.json(application);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // === STATS ===

  app.get("/api/stats/:steamId", async (req, res) => {
    try {
      const stats = await squadStatsService.getPlayerStats(req.params.steamId);
      if (!stats) {
        return res.status(404).json({ error: "Player not found" });
      }
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
