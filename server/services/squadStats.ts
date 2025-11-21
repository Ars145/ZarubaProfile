import { MongoClient, Db } from 'mongodb';
import { formatTime, calcVehicleTime, calcVehicleKills, calcKnifeKills } from '../../client/src/lib/statsCalculations.js';
import { mockSquadStatsData, mockPlayerStats, mockRanksConfig } from '../../client/src/data/mockSquadStats.js';

interface SquadStatsRaw {
  _id: string;
  name: string;
  kills: number;
  death: number;
  kd: number;
  revives: number;
  teamkills: number;
  matches: {
    matches: number;
    won: number;
    winrate: number;
  };
  squad: {
    timeplayed: number;
    leader: number;
    cmd: number;
  };
  roles: Record<string, number>;
  weapons: Record<string, number>;
  possess: Record<string, number>;
  scoreGroups: Record<string, number>;
}

interface RankConfig {
  type: string;
  icons: Record<string, Array<{ needScore: number; iconUrl: string }>>;
}

export class SquadStatsService {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private dbName: string;
  private statsCollection: string;
  private configCollection: string;
  private isConnected: boolean = false;

  constructor() {
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

  async connect(): Promise<void> {
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

  async getPlayerStats(steamId: string): Promise<any> {
    try {
      if (!this.isConnected || !this.db) {
        return this.getMockStats(steamId);
      }

      const statsCollection = this.db.collection(this.statsCollection);
      const stats = await statsCollection.findOne({ _id: steamId }) as SquadStatsRaw | null;

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

  private normalizeStats(raw: SquadStatsRaw): any {
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

  private getTopWeapon(weapons: Record<string, number>): { name: string; kills: number } | null {
    if (!weapons || Object.keys(weapons).length === 0) return null;

    const topEntry = Object.entries(weapons).sort((a, b) => b[1] - a[1])[0];
    const weaponName = topEntry[0].split('_').pop() || topEntry[0];

    return {
      name: weaponName,
      kills: topEntry[1],
    };
  }

  private getTopRole(roles: Record<string, number>): { name: string; time: string } | null {
    if (!roles || Object.keys(roles).length === 0) return null;

    const topEntry = Object.entries(roles).sort((a, b) => b[1] - a[1])[0];
    const roleName = topEntry[0].split('_').pop() || topEntry[0];

    return {
      name: roleName,
      time: formatTime(topEntry[1], 'min'),
    };
  }

  private calculateRank(scoreGroups: Record<string, number>): any {
    const infantryScore = scoreGroups['1'] || 0;
    const ranksConfig = mockRanksConfig;
    const infantryRanks = ranksConfig.icons['1'];

    let currentRank = infantryRanks[0];
    let nextRank: any = null;

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

  private getMockStats(steamId: string): any {
    let rawData = null;

    if (steamId === 'STEAM_0:1:12345678') {
      rawData = mockSquadStatsData;
    } else if (mockPlayerStats[steamId]) {
      rawData = mockPlayerStats[steamId];
    } else {
      return null;
    }

    return this.normalizeStats(rawData as SquadStatsRaw);
  }

  async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      await this.client.close();
      this.isConnected = false;
      console.log('✓ Disconnected from MongoDB');
    }
  }
}

export const squadStatsService = new SquadStatsService();
