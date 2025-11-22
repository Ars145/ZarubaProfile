// Mock данные в формате MongoDB SquadJS
// Имитация реальных данных игрового сервера Squad

export const mockSquadStatsData = {
  _id: 'STEAM_0:1:12345678',
  name: 'TacticalViper',
  
  // Основная статистика
  kills: 1245,
  death: 892,
  kd: 1.4,
  revives: 156,
  teamkills: 12,
  
  // Матчи
  matches: {
    matches: 178,
    won: 88,
    winrate: 49.44
  },
  
  // Время игры (в МИНУТАХ)
  squad: {
    timeplayed: 20520,  // 342 часа
    leader: 4027,       // 4 дня 7 часов
    cmd: 1260           // 21 час
  },
  
  // Роли (время в минутах)
  roles: {
    'US_Army_Rifleman': 5420,
    'US_Army_Medic': 3210,
    'RUS_Army_AT': 2890,
    'US_Army_Grenadier': 2100,
    'RUS_Army_Marksman': 1850,
    'US_Army_MachineGunner': 1620,
    'RUS_Army_Sapper': 980,
    'US_Army_Crewman': 750,
    'RUS_Army_Pilot': 420,
    'US_Army_Squadleader': 1280
  },
  
  // Оружие (убийства)
  weapons: {
    'US_Weapons_M4A1': 245,
    'US_Weapons_M249': 189,
    'RUS_Weapons_AK74': 167,
    'US_Weapons_M110': 98,
    'RUS_Weapons_PKM': 87,
    'US_Weapons_M67_Frag': 65,
    'RUS_Weapons_RPG7_Projectile_HEAT': 45,
    'US_Weapons_M2_Technical_M2': 34,
    'RUS_Weapons_DShK_Technical': 28,
    'US_Weapons_LAV25_25mm': 23,
    'RUS_Weapons_BTR82A_30mm': 19,
    'US_Weapons_M1A2_M256A1_120mm': 15,
    'US_Weapons_SOCP': 5,
    'RUS_Weapons_AK74Bayonet': 3,
    'US_Weapons_Projectile_155mm': 12,
    'US_Weapons_M240_Loaders_M240': 18,
    'RUS_Weapons_Kord_Tigr': 11
  },
  
  // Техника (время владения в СЕКУНДАХ!)
  possess: {
    'US_Vehicles_M1A2_Abrams': 3600,      // 1 час на танке
    'RUS_Vehicles_BTR82A': 5400,          // 1.5 часа
    'US_Vehicles_LAV25': 2700,            // 45 минут
    'US_Vehicles_UH60_Blackhawk': 1800,   // 30 минут на вертолете
    'RUS_Vehicles_MI8': 900,              // 15 минут
    'US_Vehicles_M1126_CROWS_M2': 1200,
    'RUS_Vehicles_MTLB': 600
  },
  
  // Ранги/опыт (скоры по группам)
  scoreGroups: {
    '1': 15420,  // Infantry
    '2': 8950,   // Armor
    '3': 4230    // Aviation
  }
};

// Конфигурация рангов (из configs коллекции)
export const mockRanksConfig = {
  type: 'score',
  icons: {
    '1': [  // Infantry группа
      {
        needScore: 0,
        iconUrl: '/URL:https://api.dicebear.com/7.x/shapes/svg?seed=rank1'
      },
      {
        needScore: 1000,
        iconUrl: '/URL:https://api.dicebear.com/7.x/shapes/svg?seed=rank2+'
      },
      {
        needScore: 5000,
        iconUrl: '/URL:https://api.dicebear.com/7.x/shapes/svg?seed=rank3+'
      },
      {
        needScore: 10000,
        iconUrl: '/URL:https://api.dicebear.com/7.x/shapes/svg?seed=rank4+'
      },
      {
        needScore: 20000,
        iconUrl: '/URL:https://api.dicebear.com/7.x/shapes/svg?seed=rank5+'
      }
    ],
    '2': [  // Armor группа
      {
        needScore: 0,
        iconUrl: '/URL:https://api.dicebear.com/7.x/identicon/svg?seed=armor1'
      },
      {
        needScore: 2000,
        iconUrl: '/URL:https://api.dicebear.com/7.x/identicon/svg?seed=armor2+'
      },
      {
        needScore: 8000,
        iconUrl: '/URL:https://api.dicebear.com/7.x/identicon/svg?seed=armor3+'
      },
      {
        needScore: 15000,
        iconUrl: '/URL:https://api.dicebear.com/7.x/identicon/svg?seed=armor4+'
      }
    ],
    '3': [  // Aviation группа
      {
        needScore: 0,
        iconUrl: '/URL:https://api.dicebear.com/7.x/bottts/svg?seed=avia1'
      },
      {
        needScore: 1500,
        iconUrl: '/URL:https://api.dicebear.com/7.x/bottts/svg?seed=avia2+'
      },
      {
        needScore: 5000,
        iconUrl: '/URL:https://api.dicebear.com/7.x/bottts/svg?seed=avia3+'
      }
    ]
  }
};

// Дополнительные mock данные для других игроков
export const mockPlayerStats = {
  'STEAM_0:1:99999999': {
    _id: 'STEAM_0:1:99999999',
    name: 'SniperWolf',
    kills: 2405,
    death: 1100,
    kd: 2.2,
    revives: 89,
    teamkills: 8,
    matches: {
      matches: 450,
      won: 270,
      winrate: 60
    },
    squad: {
      timeplayed: 43200,  // 720 часов
      leader: 7200,
      cmd: 0
    },
    roles: {
      'US_Army_Marksman': 15000,
      'RUS_Army_Marksman': 12000,
      'US_Army_Rifleman': 8000,
      'US_Army_Grenadier': 4200
    },
    weapons: {
      'US_Weapons_M110': 890,
      'RUS_Weapons_SVD': 750,
      'US_Weapons_M4A1': 420,
      'RUS_Weapons_AK74': 245
    },
    possess: {
      'US_Vehicles_M1126_CROWS_M2': 1800
    },
    scoreGroups: {
      '1': 28500,
      '2': 3200,
      '3': 800
    }
  },
  'STEAM_0:1:88888888': {
    _id: 'STEAM_0:1:88888888',
    name: 'MedicMain',
    kills: 489,
    death: 650,
    kd: 0.75,
    revives: 892,
    teamkills: 2,
    matches: {
      matches: 142,
      won: 71,
      winrate: 50
    },
    squad: {
      timeplayed: 18000,
      leader: 1200,
      cmd: 0
    },
    roles: {
      'US_Army_Medic': 12000,
      'RUS_Army_Medic': 4500,
      'US_Army_Rifleman': 1200
    },
    weapons: {
      'US_Weapons_M4A1': 245,
      'RUS_Weapons_AK74': 178,
      'US_Weapons_M67_Frag': 45
    },
    possess: {},
    scoreGroups: {
      '1': 22400,
      '2': 500,
      '3': 100
    }
  }
};

// Функция для получения статистики по Steam ID
export function getPlayerStatsBySteamId(steamId) {
  if (steamId === 'STEAM_0:1:12345678') {
    return mockSquadStatsData;
  }
  return mockPlayerStats[steamId] || null;
}
