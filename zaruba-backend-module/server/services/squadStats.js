import { MongoClient } from 'mongodb';
import { formatTime, calcVehicleTime, calcVehicleKills, calcKnifeKills } from '../../client/src/lib/statsCalculations.js';
import { mockSquadStatsData, mockPlayerStats, mockRanksConfig } from '../../client/src/data/mockSquadStats.js';

export class SquadStatsService {
  constructor() {
    this.client = null;
    this.db = null;
    this.isConnected = false;
    
    const mongoUri = process.env.MONGO_URI || '';
    this.dbName = process.env.MONGO_DB || 'squadjs';
    this.statsCollection = process.env.MONGO_COLLECTION_STATS || 'mainstats';
    this.configCollection = process.env.MONGO_COLLECTION_CONFIG || 'configs';

    if (!mongoUri) {
      console.warn('⚠️  MONGO_URI not set, Squad stats will use mock data');
    } else {
      this.client = new MongoClient(mongoUri);
    }
  }

  async connect() {
    if (!this.client) {
      console.log('📊 Using mock Squad stats (MongoDB not configured)');
      return;
    }

    try {
      await this.client.connect();
      this.db = this.client.db(this.dbName);
      this.isConnected = true;
      console.log('✓ Connected to MongoDB (SquadJS stats)');
    } catch (err) {
      console.error('✗ Failed to connect to MongoDB:', err);
      this.isConnected = false;
    }
  }

  async getPlayerStats(steamId) {
    try {
      if (!this.isConnected || !this.db) {
        return this.getMockStats(steamId);
      }

      const statsCollection = this.db.collection(this.statsCollection);
      const stats = await statsCollection.findOne({ _id: steamId });

      if (!stats) {
        console.log(`Player ${steamId} not found in MongoDB, using mock data`);
        return this.getMockStats(steamId);
      }

      return this.normalizeStats(stats);
    } catch (err) {
      console.error('Error fetching Squad stats from MongoDB:', err);
      return this.getMockStats(steamId);
    }
  }

  normalizeStats(raw) {
    const playtime = formatTime(raw.squad.timeplayed, 'min');
    const squadLeaderTime = formatTime(raw.squad.leader, 'min');
    const commanderTime = formatTime(raw.squad.cmd, 'min');

    const topWeapon = this.getTopWeapon(raw.weapons);
    const topRole = this.getTopRole(raw.roles);
    const [heavyTime, heliTime] = calcVehicleTime(raw.possess);
    const vehicleKills = calcVehicleKills(raw.weapons);
    const knifeKills = calcKnifeKills(raw.weapons);

    return {
      steamId: raw._id,
      name: raw.name,
      kills: raw.kills,
      deaths: raw.death,
      kd: raw.kd,
      revives: raw.revives,
      teamkills: raw.teamkills,
      matches: raw.matches,
      playtime,
      squadLeaderTime,
      commanderTime,
      rank: this.calculateRank(raw.scoreGroups),
      topWeapon,
      topRole,
      vehicleTime: {
        heavy: formatTime(heavyTime, 'sec'),
        heli: formatTime(heliTime, 'sec'),
      },
      vehicleKills,
      knifeKills,
    };
  }

  getTopWeapon(weapons) {
    if (!weapons || Object.keys(weapons).length === 0) return null;

    const topEntry = Object.entries(weapons).sort((a, b) => b[1] - a[1])[0];
    const weaponName = topEntry[0].split('_').pop() || topEntry[0];

    return {
      name: weaponName,
      kills: topEntry[1],
    };
  }

  getTopRole(roles) {
    if (!roles || Object.keys(roles).length === 0) return null;

    const topEntry = Object.entries(roles).sort((a, b) => b[1] - a[1])[0];
    const roleName = topEntry[0].split('_').pop() || topEntry[0];

    return {
      name: roleName,
      time: formatTime(topEntry[1], 'min'),
    };
  }

  calculateRank(scoreGroups) {
    const infantryScore = scoreGroups['1'] || 0;
    const ranksConfig = mockRanksConfig;
    const infantryRanks = ranksConfig.icons['1'];

    let currentRank = infantryRanks[0];
    let nextRank = null;

    for (let i = 0; i < infantryRanks.length; i++) {
      if (infantryScore >= infantryRanks[i].needScore) {
        currentRank = infantryRanks[i];
        nextRank = infantryRanks[i + 1] || null;
      } else {
        break;
      }
    }

    let progress = 0;
    if (nextRank) {
      const currentNeed = currentRank.needScore;
      const nextNeed = nextRank.needScore;
      progress = ((infantryScore - currentNeed) / (nextNeed - currentNeed)) * 100;
    }

    return {
      current: {
        iconUrl: currentRank.iconUrl,
        needScore: currentRank.needScore,
      },
      next: nextRank
        ? {
            iconUrl: nextRank.iconUrl,
            needScore: nextRank.needScore,
          }
        : null,
      progress: Math.min(100, Math.max(0, progress)),
    };
  }

  getMockStats(steamId) {
    let rawData = null;

    if (steamId === 'STEAM_0:1:12345678') {
      rawData = mockSquadStatsData;
    } else if (mockPlayerStats[steamId]) {
      rawData = mockPlayerStats[steamId];
    } else {
      return null;
    }

    return this.normalizeStats(rawData);
  }

  async disconnect() {
    if (this.client && this.isConnected) {
      await this.client.close();
      this.isConnected = false;
      console.log('✓ Disconnected from MongoDB');
    }
  }
}

export const squadStatsService = new SquadStatsService();
