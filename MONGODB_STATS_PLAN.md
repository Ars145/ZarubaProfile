# План Интеграции Статистики из MongoDB (Squad Server)

## 📋 Обзор

### Текущая Ситуация
У вас есть:
- **Discord бот** который получает статистику из MongoDB
- **MongoDB база "SquadJS"** с игровой статистикой Squad сервера
- **Детальная статистика**: оружие, роли, техника, ранги

### Цель Интеграции
Подключить существующую MongoDB базу статистики к нашему веб-компоненту профиля:
- PostgreSQL - для профилей, кланов, заявок (наши данные)
- MongoDB - для детальной игровой статистики (данные игрового сервера)

---

## 🗄️ Структура MongoDB (Существующая)

### База Данных: `SquadJS`

#### Коллекция: `mainstats`

```javascript
{
  _id: "STEAM_0:1:12345678",              // Steam ID (первичный ключ)
  name: "TacticalViper",                  // Имя игрока
  
  // Основная статистика
  kills: 1245,                             // Убийства
  death: 892,                              // Смерти
  kd: 1.42,                                // K/D ratio
  revives: 82,                             // Возрождения (Помощь)
  teamkills: 39,                           // Тимкиллы
  
  // Матчи
  matches: {
    matches: 178,                          // Всего матчей
    won: 88,                               // Победы
    winrate: 49.44                         // % побед
  },
  
  // Время игры (в МИНУТАХ)
  squad: {
    timeplayed: 20520,                     // Общее время (342ч = 20520мин)
    leader: 4027,                          // Время сквад-лидером (4д 7ч)
    cmd: 1260                              // Время командиром (21ч)
  },
  
  // Роли (время в минутах)
  roles: {
    "US_Army_Rifleman": 5420,
    "US_Army_Medic": 3210,
    "RUS_Army_AT": 2890,
    // ... другие роли
  },
  
  // Оружие (убийства)
  weapons: {
    "US_Weapons_M4A1": 245,
    "US_Weapons_M249": 189,
    "RUS_Weapons_RPG29_Projectile_HEAT": 45,
    "US_Weapons_SOCP": 5,                  // Нож
    // ... другое оружие
  },
  
  // Техника (время владения в секундах!)
  possess: {
    "US_Vehicles_M1A2_Abrams": 3600,       // 1 час
    "RUS_Vehicles_UH60_Blackhawk": 1800,   // 30 минут
    // ... другая техника
  },
  
  // Ранги/опыт (скоры по группам)
  scoreGroups: {
    "1": 15420,                            // Группа 1 (Infantry)
    "2": 8950,                             // Группа 2 (Armor)
    "3": 4230,                             // Группа 3 (Aviation)
    // ...
  }
}
```

#### Коллекция: `configs`

```javascript
{
  type: "score",
  icons: {
    "1": [                                 // Группа 1
      {
        needScore: 0,
        iconUrl: "/URL:path/to/icon1.png"
      },
      {
        needScore: 1000,
        iconUrl: "/URL:path/to/icon2.png+"
      },
      // ... другие ранги
    ],
    "2": [ /* ... */ ],
    "3": [ /* ... */ ]
  }
}
```

---

## 🔗 Архитектура Интеграции

### Два Источника Данных

```
┌─────────────────────────────────────────┐
│         ZARUBA Web Application          │
└─────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌───────────────┐       ┌──────────────┐
│  PostgreSQL   │       │   MongoDB    │
│   (Replit)    │       │ (Game Server)│
├───────────────┤       ├──────────────┤
│ • players     │       │ • mainstats  │
│ • clans       │       │ • configs    │
│ • members     │       │              │
│ • apps        │       │              │
└───────────────┘       └──────────────┘
      │                       │
      │                       │
      └──────────┬────────────┘
                 │
                 ▼
        ┌────────────────┐
        │  API Layer     │
        │  (Express)     │
        └────────────────┘
```

### Связь Между Базами

```javascript
// PostgreSQL (players)
{
  id: "uuid-123",
  username: "TacticalViper",
  steamId: "STEAM_0:1:12345678",  // ← СВЯЗЬ
  ...
}

// MongoDB (mainstats)
{
  _id: "STEAM_0:1:12345678",      // ← СВЯЗЬ
  name: "TacticalViper",
  kills: 1245,
  ...
}
```

**Ключ связи:** `steamId` / `_id`

---

## 📊 Новая Структура PostgreSQL

### Таблица `players` (ОБНОВЛЕННАЯ)

```sql
CREATE TABLE players (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  steam_id TEXT UNIQUE,                    -- ← КЛЮЧ СВЯЗИ с MongoDB
  discord_id TEXT,
  avatar_url TEXT,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  is_vip BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'offline',
  
  -- Флаг синхронизации
  sync_stats BOOLEAN DEFAULT true,         -- Включить синхронизацию с MongoDB
  stats_last_synced TIMESTAMP,             -- Последняя синхронизация
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Таблица `player_stats` (УПРОЩЕННАЯ - только кеш)

```sql
-- Эта таблица теперь КЕШИРУЕТ данные из MongoDB
-- Для быстрого отображения без запросов к Mongo
CREATE TABLE player_stats_cache (
  player_id VARCHAR PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
  
  -- Основная статистика (из MongoDB)
  kills INTEGER DEFAULT 0,
  deaths INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  games INTEGER DEFAULT 0,
  playtime_minutes INTEGER DEFAULT 0,
  
  -- Вычисляемые
  kd DECIMAL(5,2),                         -- kills/deaths
  winrate DECIMAL(5,2),                    -- wins/games * 100
  
  -- Время ролей
  squad_leader_minutes INTEGER DEFAULT 0,
  commander_minutes INTEGER DEFAULT 0,
  
  -- Дополнительно
  revives INTEGER DEFAULT 0,
  team_kills INTEGER DEFAULT 0,
  
  -- Время вычисляемое из possess (MongoDB)
  driver_minutes INTEGER DEFAULT 0,        -- Тяжелая техника
  pilot_minutes INTEGER DEFAULT 0,         -- Вертолеты
  
  -- Вычисляемые убийства
  vehicle_kills INTEGER DEFAULT 0,
  knife_kills INTEGER DEFAULT 0,
  
  -- Метаданные
  synced_at TIMESTAMP DEFAULT NOW(),       -- Когда кеш обновлен
  is_stale BOOLEAN DEFAULT false           -- Нужно обновить
);
```

---

## 🔌 API Endpoints (Новые)

### Stats API

#### `GET /api/stats/player/:steamId`
Получить ПОЛНУЮ статистику игрока из MongoDB

**Response:**
```json
{
  "player": {
    "steamId": "STEAM_0:1:12345678",
    "name": "TacticalViper",
    "stats": {
      "kills": 1245,
      "deaths": 892,
      "kd": 1.42,
      "revives": 82,
      "teamkills": 39,
      "matches": {
        "total": 178,
        "won": 88,
        "winrate": 49.44
      },
      "playtime": {
        "total": "342ч",
        "squadLeader": "4д 7ч",
        "commander": "21ч",
        "driver": "15ч",
        "pilot": "30м"
      }
    },
    "topRole": {
      "name": "Rifleman",
      "time": "90ч 20м",
      "icon": "US_Army_Rifleman"
    },
    "topWeapon": {
      "name": "M4A1",
      "kills": 245
    },
    "rank": {
      "current": {
        "name": "Sergeant",
        "icon": "https://...",
        "score": 15420
      },
      "next": {
        "name": "Staff Sergeant",
        "icon": "https://...",
        "needScore": 20000
      },
      "progress": 77.1
    }
  }
}
```

#### `GET /api/stats/player/:steamId/detailed`
Детальная статистика (все оружие, все роли, вся техника)

**Response:**
```json
{
  "roles": [
    { "name": "Rifleman", "time": 5420, "formatted": "90ч 20м" },
    { "name": "Medic", "time": 3210, "formatted": "53ч 30м" }
  ],
  "weapons": [
    { "name": "M4A1", "kills": 245 },
    { "name": "M249", "kills": 189 }
  ],
  "vehicles": [
    { "name": "M1A2 Abrams", "time": 3600, "formatted": "60ч" }
  ]
}
```

#### `POST /api/stats/sync/:playerId`
Принудительная синхронизация статистики из MongoDB в PostgreSQL кеш

**Response:**
```json
{
  "success": true,
  "syncedAt": "2024-11-20T10:00:00Z",
  "stats": { /* cached stats */ }
}
```

---

## 💾 Storage Interface (Обновленный)

```typescript
// server/storage.ts

export interface IStorage {
  // ... existing methods ...
  
  // MongoDB Stats Methods
  getMongoStats(steamId: string): Promise<MongoPlayerStats | null>;
  getMongoStatsDetailed(steamId: string): Promise<MongoDetailedStats>;
  syncPlayerStats(playerId: string): Promise<void>;
  
  // Cache Methods
  getPlayerStatsCache(playerId: string): Promise<PlayerStatsCache | null>;
  updatePlayerStatsCache(playerId: string, stats: MongoPlayerStats): Promise<void>;
}
```

---

## 🔧 Реализация

### Шаг 1: MongoDB Connection

```typescript
// server/mongo.ts
import { MongoClient } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/';
const DB_NAME = 'SquadJS';

let cachedClient: MongoClient | null = null;

export async function getMongoClient(): Promise<MongoClient> {
  if (cachedClient) {
    return cachedClient;
  }
  
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  cachedClient = client;
  
  return client;
}

export async function getMainStatsCollection() {
  const client = await getMongoClient();
  return client.db(DB_NAME).collection('mainstats');
}

export async function getConfigsCollection() {
  const client = await getMongoClient();
  return client.db(DB_NAME).collection('configs');
}
```

### Шаг 2: Stats Service

```typescript
// server/services/statsService.ts
import { getMainStatsCollection, getConfigsCollection } from '../mongo';
import { calcVehicleTime, calcVehicleKills } from '../utils/statsCalculations';

export async function getPlayerStats(steamId: string) {
  const collection = await getMainStatsCollection();
  const player = await collection.findOne({ _id: steamId });
  
  if (!player) {
    throw new Error('Player not found in stats database');
  }
  
  // Расчет производных данных
  const [heavyTime, heliTime] = calcVehicleTime(player.possess);
  const vehicleKills = calcVehicleKills(player.weapons);
  const knifeKills = calcKnifeKills(player.weapons);
  
  // Топ роль
  const topRole = getTopRole(player.roles);
  
  // Топ оружие
  const topWeapon = getTopWeapon(player.weapons);
  
  // Текущий ранг
  const rank = await getCurrentRank(player);
  
  return {
    steamId,
    name: player.name,
    stats: {
      kills: player.kills,
      deaths: player.death,
      kd: player.kd,
      revives: player.revives,
      teamkills: player.teamkills,
      matches: {
        total: player.matches.matches,
        won: player.matches.won,
        winrate: player.matches.winrate
      },
      playtime: {
        total: formatTime(player.squad.timeplayed),
        squadLeader: formatTime(player.squad.leader),
        commander: formatTime(player.squad.cmd),
        driver: formatTime(heavyTime, 'sec'),
        pilot: formatTime(heliTime, 'sec')
      }
    },
    topRole,
    topWeapon,
    rank,
    vehicleKills,
    knifeKills
  };
}

function formatTime(minutes: number, unit: 'min' | 'sec' = 'min'): string {
  let totalMinutes = minutes;
  if (unit === 'sec') {
    totalMinutes = Math.floor(minutes / 60);
  }
  
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const mins = totalMinutes % 60;
  
  if (days > 0) return `${days}д ${hours}ч`;
  if (hours > 0) return `${hours}ч ${mins}м`;
  return `${mins}м`;
}

function getTopRole(roles: Record<string, number>) {
  const sorted = Object.entries(roles).sort((a, b) => b[1] - a[1]);
  if (sorted.length === 0) return null;
  
  const [roleName, time] = sorted[0];
  return {
    name: roleName.split('_').pop() || roleName,
    time: formatTime(time),
    icon: roleName
  };
}

function getTopWeapon(weapons: Record<string, number>) {
  // Исключаем технику и ножи
  const filtered = Object.entries(weapons).filter(([key]) => {
    return !isVehicleWeapon(key) && !isKnifeWeapon(key);
  });
  
  const sorted = filtered.sort((a, b) => b[1] - a[1]);
  if (sorted.length === 0) return null;
  
  const [weaponName, kills] = sorted[0];
  return {
    name: weaponName.split('_').pop() || weaponName,
    kills
  };
}

async function getCurrentRank(player: any) {
  const configCollection = await getConfigsCollection();
  const config = await configCollection.findOne({ type: 'score' });
  
  if (!config) return null;
  
  // Находим группу с максимальным скором
  const scoreGroups = player.scoreGroups || {};
  let maxGroup = '1';
  let maxScore = 0;
  
  for (const [groupId, score] of Object.entries(scoreGroups)) {
    if (score > maxScore) {
      maxScore = score as number;
      maxGroup = groupId;
    }
  }
  
  const ranks = config.icons[maxGroup];
  if (!ranks) return null;
  
  // Находим текущий и следующий ранг
  let current = null;
  let next = null;
  
  for (const rank of ranks) {
    if (maxScore >= rank.needScore) {
      current = rank;
    } else if (!next) {
      next = rank;
      break;
    }
  }
  
  const progress = next ? (maxScore / next.needScore) * 100 : 100;
  
  return {
    current: current ? {
      icon: parseIconUrl(current.iconUrl),
      score: maxScore
    } : null,
    next: next ? {
      icon: parseIconUrl(next.iconUrl),
      needScore: next.needScore
    } : null,
    progress: Math.min(progress, 100)
  };
}

function parseIconUrl(url: string): string {
  return url.replace('/URL:', '').replace(/\+$/, '');
}
```

### Шаг 3: Utility Functions

```typescript
// server/utils/statsCalculations.ts

const HEAVY_VEHICLES = [
  'ZTZ99', 'T72B3', 'T62', 'M1A1', 'M1A2', '2A6', 'FV4034',
  'ZBD04A', 'FV510', 'BFV', 'BMP2', 'BMP1', 'MTLB',
  'LAV25', 'BTR82A', 'BTR80', 'Sprut'
  // ... остальные
];

const HELI_VEHICLES = [
  'Z8G', 'CH146', 'MRH90', 'SA330', 'MI8',
  'UH60', 'UH1Y', 'MI17', 'Z8J'
];

const VEHICLE_WEAPONS = [
  '_pg9v_', '_White_ZU23_', '_M2_Technical_',
  '_30mm_', 'LAV25_', '_125mm_', '_120mm_'
  // ... остальные
];

const KNIFE_WEAPONS = [
  'SOCP', 'AK74Bayonet', 'M9Bayonet', 'G3Bayonet',
  'Bayonet2000', 'AKMBayonet', 'SA80Bayonet', 'QNL-95', 'OKC-3S'
];

export function calcVehicleTime(possess: Record<string, number>): [number, number] {
  let heavyTime = 0;
  let heliTime = 0;
  
  for (const [key, time] of Object.entries(possess)) {
    const vehicleType = key.split('_')[1];
    
    if (HELI_VEHICLES.includes(vehicleType)) {
      heliTime += time;
    }
    if (HEAVY_VEHICLES.includes(vehicleType)) {
      heavyTime += time;
    }
  }
  
  return [heavyTime, heliTime];
}

export function calcVehicleKills(weapons: Record<string, number>): number {
  let total = 0;
  
  for (const [weapon, kills] of Object.entries(weapons)) {
    if (isVehicleWeapon(weapon)) {
      total += kills;
    }
  }
  
  return total;
}

export function calcKnifeKills(weapons: Record<string, number>): number {
  let total = 0;
  
  for (const [weapon, kills] of Object.entries(weapons)) {
    if (isKnifeWeapon(weapon)) {
      total += kills;
    }
  }
  
  return total;
}

export function isVehicleWeapon(weaponKey: string): boolean {
  return VEHICLE_WEAPONS.some(vw => weaponKey.includes(vw));
}

export function isKnifeWeapon(weaponKey: string): boolean {
  const weaponName = weaponKey.split('_').pop() || '';
  return KNIFE_WEAPONS.includes(weaponName);
}
```

### Шаг 4: API Routes

```typescript
// server/routes.ts

// Stats endpoints
app.get('/api/stats/player/:steamId', async (req, res) => {
  try {
    const { steamId } = req.params;
    const stats = await getPlayerStats(steamId);
    res.json({ player: stats });
  } catch (error) {
    if (error.message === 'Player not found in stats database') {
      res.status(404).json({ error: 'Player not found' });
    } else {
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  }
});

app.get('/api/stats/player/:steamId/detailed', async (req, res) => {
  try {
    const { steamId } = req.params;
    const stats = await getPlayerStatsDetailed(steamId);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch detailed stats' });
  }
});

// Sync cache
app.post('/api/stats/sync/:playerId', async (req, res) => {
  try {
    const { playerId } = req.params;
    
    // Получить steamId из PostgreSQL
    const player = await storage.getPlayer(playerId);
    if (!player || !player.steamId) {
      return res.status(404).json({ error: 'Player not found or no Steam ID' });
    }
    
    // Получить статистику из MongoDB
    const mongoStats = await getPlayerStats(player.steamId);
    
    // Обновить кеш в PostgreSQL
    await storage.updatePlayerStatsCache(playerId, mongoStats);
    
    res.json({
      success: true,
      syncedAt: new Date().toISOString(),
      stats: mongoStats
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to sync stats' });
  }
});
```

---

## 🎨 Frontend Integration

### React Hook для Статистики

```typescript
// client/src/hooks/usePlayerStats.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function usePlayerStats(steamId: string | null) {
  return useQuery({
    queryKey: ['stats', steamId],
    queryFn: () => api.getPlayerStats(steamId!),
    enabled: !!steamId,
    staleTime: 5 * 60 * 1000, // 5 минут
  });
}

export function usePlayerStatsDetailed(steamId: string | null) {
  return useQuery({
    queryKey: ['stats-detailed', steamId],
    queryFn: () => api.getPlayerStatsDetailed(steamId!),
    enabled: !!steamId,
  });
}
```

### Обновленный API Client

```typescript
// client/src/lib/api.ts
class ApiClient {
  // ... existing methods ...
  
  async getPlayerStats(steamId: string) {
    return this.request<PlayerStatsResponse>(`/stats/player/${steamId}`);
  }
  
  async getPlayerStatsDetailed(steamId: string) {
    return this.request<DetailedStatsResponse>(`/stats/player/${steamId}/detailed`);
  }
  
  async syncPlayerStats(playerId: string) {
    return this.request<SyncResponse>(`/stats/sync/${playerId}`, {
      method: 'POST'
    });
  }
}
```

### Использование в Компоненте

```tsx
// client/src/pages/profile.jsx
export default function ProfilePage() {
  const { profile } = useProfile();
  const { data: stats, isLoading } = usePlayerStats(profile?.steamId);
  
  if (isLoading) return <LoadingSpinner />;
  
  return (
    <div>
      <h1>{stats?.player.name}</h1>
      <div>
        <p>Kills: {stats?.player.stats.kills}</p>
        <p>K/D: {stats?.player.stats.kd}</p>
        <p>Playtime: {stats?.player.stats.playtime.total}</p>
      </div>
      
      <div>
        <h2>Top Role: {stats?.player.topRole?.name}</h2>
        <p>Time: {stats?.player.topRole?.time}</p>
      </div>
      
      <div>
        <h2>Rank Progress</h2>
        <ProgressBar value={stats?.player.rank?.progress} />
      </div>
    </div>
  );
}
```

---

## ⚙️ Environment Variables

```env
# PostgreSQL (Replit)
DATABASE_URL=postgresql://...

# MongoDB (Game Server)
MONGO_URI=mongodb://user:password@host:27017/
MONGO_DB_NAME=SquadJS

# Optional: Caching
STATS_CACHE_TTL=300  # 5 минут
```

---

## 🚀 Deployment Checklist

### Шаг 1: MongoDB Connection
- [ ] Получить credentials от MongoDB сервера
- [ ] Добавить MONGO_URI в .env
- [ ] Протестировать подключение

### Шаг 2: Database Migration
- [ ] Обновить PostgreSQL схему (добавить sync_stats, stats_last_synced)
- [ ] Создать таблицу player_stats_cache
- [ ] Добавить индексы

### Шаг 3: Backend Implementation
- [ ] Установить mongodb пакет: `npm install mongodb`
- [ ] Создать mongo.ts connection
- [ ] Создать statsService.ts
- [ ] Добавить stats routes
- [ ] Протестировать endpoints

### Шаг 4: Frontend Integration
- [ ] Создать usePlayerStats hook
- [ ] Обновить ProfilePage
- [ ] Обновить API client
- [ ] Тестирование UI

### Шаг 5: Caching Strategy
- [ ] Настроить автоматическую синхронизацию (cron job)
- [ ] Реализовать stale check
- [ ] Добавить manual sync button

---

## 🔄 Автоматическая Синхронизация (Опционально)

```typescript
// server/jobs/syncStats.ts
import cron from 'node-cron';

// Синхронизировать статистику каждые 5 минут для онлайн игроков
cron.schedule('*/5 * * * *', async () => {
  console.log('Syncing stats for online players...');
  
  const onlinePlayers = await storage.getOnlinePlayers();
  
  for (const player of onlinePlayers) {
    if (player.steamId && player.syncStats) {
      try {
        const mongoStats = await getPlayerStats(player.steamId);
        await storage.updatePlayerStatsCache(player.id, mongoStats);
        console.log(`Synced stats for ${player.username}`);
      } catch (error) {
        console.error(`Failed to sync stats for ${player.username}:`, error);
      }
    }
  }
});
```

---

## 📊 Преимущества Этого Подхода

### 1. **Разделение Ответственности**
- PostgreSQL - профили, кланы (наш контроль)
- MongoDB - игровая статистика (сервер Squad контролирует)

### 2. **Производительность**
- Кеш в PostgreSQL для быстрого отображения
- MongoDB только для детальных запросов

### 3. **Гибкость**
- Можно включить/выключить синхронизацию per-player
- Легко добавить новые поля статистики

### 4. **Надежность**
- Если MongoDB недоступна - показываем кешированные данные
- Graceful degradation

---

## 🎯 Следующие Шаги

1. **Подтвердить структуру MongoDB** - проверить что поля совпадают
2. **Получить credentials** - доступ к MongoDB серверу
3. **Реализовать базовую интеграцию** - один endpoint для теста
4. **Добавить UI** - показать статистику в профиле
5. **Оптимизировать** - добавить кеширование и синхронизацию

---

**Готово к реализации!** 🚀

Этот план позволяет использовать существующую MongoDB базу статистики Squad сервера, 
интегрируя её с нашим веб-приложением через чистый API слой.
