# План реализации частичного бекэнда для ZARUBA Clan Management

## Цель
Создать REST API бекэнд для управления кланами, заявками и членством, который легко интегрируется в основной проект ZARUBA. Бекэнд будет обрабатывать данные приложения в PostgreSQL и читать игровую статистику из существующей MongoDB базы данных SquadJS.

## Архитектура

### Двухбазовая стратегия
- **PostgreSQL (Neon)**: Хранение данных приложения (кланы, игроки, заявки, членство)
- **MongoDB (SquadJS)**: Только чтение игровой статистики Squad (kill/death, playtime, weapons, etc.)

### Слои приложения
```
Client (React) → REST API (/api/*) → Storage Interface → Databases
                                    ↓
                              Squad Stats Service → MongoDB (Read-Only)
```

---

## 1. Схема базы данных (shared/schema.ts)

### Таблицы PostgreSQL

#### 1.1 players (Игроки)
```typescript
{
  id: uuid (PK, auto)
  steamId: text (unique, NOT NULL) - Steam ID игрока
  username: text (NOT NULL) - Игровое имя
  discordId: text (nullable) - Discord ID для привязки
  currentClanId: uuid (FK → clans.id, nullable) - Текущий клан игрока
}
```

**Назначение**: Профили игроков, связь Steam ID с кланом и Discord аккаунтом.

#### 1.2 clans (Кланы)
```typescript
{
  id: uuid (PK, auto)
  name: text (NOT NULL) - Название клана ("Отряд Альфа")
  tag: text (NOT NULL, unique) - Тег клана ("ALPHA")
  description: text (NOT NULL) - Описание клана
  theme: text (NOT NULL, default: "orange") - Цветовая тема: orange|blue|yellow
  bannerUrl: text (nullable) - URL баннера клана
  logoUrl: text (nullable) - URL логотипа клана
  requirements: jsonb (NOT NULL, default: {}) - Требования к вступлению
    {
      microphone: boolean,
      ageRestriction: boolean,
      customRequirement: string (max 30 chars)
    }
  createdAt: timestamp (default: now())
}
```

**Назначение**: Основная информация о кланах, настройки владельца (требования и тема).

#### 1.3 clan_members (Члены кланов)
```typescript
{
  id: uuid (PK, auto)
  clanId: uuid (FK → clans.id, NOT NULL, ON DELETE CASCADE)
  playerId: uuid (FK → players.id, NOT NULL, ON DELETE CASCADE)
  role: text (NOT NULL) - Роль: "owner" | "member"
  statsSnapshot: jsonb (nullable) - Снимок статистики на момент вступления
    {
      kills: number,
      deaths: number,
      kd: number,
      winrate: number,
      playtime: string
    }
  joinedAt: timestamp (default: now())
}
```

**Unique constraint**: (clanId, playerId) - игрок может быть только в одном клане
**Назначение**: Связь многие-ко-многим между игроками и кланами, роли и история.

#### 1.4 clan_applications (Заявки на вступление)
```typescript
{
  id: uuid (PK, auto)
  clanId: uuid (FK → clans.id, NOT NULL, ON DELETE CASCADE)
  playerName: text (NOT NULL) - Имя кандидата (из Squad stats)
  playerSteamId: text (NOT NULL) - Steam ID кандидата
  message: text (NOT NULL) - Сопроводительное письмо (max 500 chars)
  status: text (NOT NULL, default: "pending") - Статус: pending|accepted|rejected
  statsSnapshot: jsonb (NOT NULL) - Статистика игрока на момент подачи заявки
    {
      games: number,
      hours: string,
      kills: number,
      deaths: number,
      kd: number,
      winrate: number,
      // ... другие поля из Squad stats
    }
  createdAt: timestamp (default: now())
}
```

**Назначение**: Заявки на вступление в клан с прикреплённой статистикой для оценки владельцем.

### Drizzle Schema Example
```typescript
import { pgTable, uuid, text, timestamp, jsonb } from "drizzle-orm/pg-core";

export const players = pgTable("players", {
  id: uuid("id").primaryKey().defaultRandom(),
  steamId: text("steam_id").notNull().unique(),
  username: text("username").notNull(),
  discordId: text("discord_id"),
  currentClanId: uuid("current_clan_id").references(() => clans.id)
});

export const clans = pgTable("clans", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  tag: text("tag").notNull().unique(),
  description: text("description").notNull(),
  theme: text("theme").notNull().default("orange"), // enum: orange, blue, yellow
  bannerUrl: text("banner_url"),
  logoUrl: text("logo_url"),
  requirements: jsonb("requirements").notNull().default({}),
  createdAt: timestamp("created_at").defaultNow()
});

export const clanMembers = pgTable("clan_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  clanId: uuid("clan_id").notNull().references(() => clans.id, { onDelete: "cascade" }),
  playerId: uuid("player_id").notNull().references(() => players.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // enum: owner, member
  statsSnapshot: jsonb("stats_snapshot"),
  joinedAt: timestamp("joined_at").defaultNow()
});

export const clanApplications = pgTable("clan_applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  clanId: uuid("clan_id").notNull().references(() => clans.id, { onDelete: "cascade" }),
  playerName: text("player_name").notNull(),
  playerSteamId: text("player_steam_id").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("pending"), // enum: pending, accepted, rejected
  statsSnapshot: jsonb("stats_snapshot").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
```

---

## 2. REST API Endpoints (server/routes.ts)

### Base URL: `/api`

#### 2.1 Clans
```
GET    /api/clans                      - Список всех кланов
GET    /api/clans/:id                  - Детали клана
POST   /api/clans                      - Создать клан (auth required)
PATCH  /api/clans/:id/settings         - Обновить настройки клана (owner only)
DELETE /api/clans/:id                  - Удалить клан (owner only)
```

**GET /api/clans** - Возвращает список всех кланов
```json
Response 200:
[
  {
    "id": "uuid",
    "name": "Отряд Альфа",
    "tag": "ALPHA",
    "description": "Элитный отряд...",
    "theme": "orange",
    "bannerUrl": "https://...",
    "logoUrl": "https://...",
    "requirements": {
      "microphone": true,
      "ageRestriction": true,
      "customRequirement": "100ч+"
    },
    "memberCount": 5
  }
]
```

**GET /api/clans/:id** - Детали клана с членами
```json
Response 200:
{
  "clan": { /* clan object */ },
  "members": [
    {
      "id": "uuid",
      "playerId": "uuid",
      "playerName": "TacticalViper",
      "role": "owner",
      "joinedAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

**PATCH /api/clans/:id/settings** - Обновить настройки (owner only)
```json
Request Body:
{
  "theme": "blue",
  "requirements": {
    "microphone": false,
    "ageRestriction": true,
    "customRequirement": "Steam level 10+"
  }
}

Response 200:
{
  "clan": { /* updated clan */ }
}
```

#### 2.2 Clan Members
```
GET    /api/clans/:id/members          - Список членов клана
POST   /api/clans/:id/members          - Добавить игрока в клан (owner only)
PATCH  /api/clans/:id/members/:memberId - Изменить роль члена (owner only)
DELETE /api/clans/:id/members/:memberId - Удалить из клана (owner or self)
```

#### 2.3 Applications
```
GET    /api/clans/:id/applications     - Список заявок клана (owner only)
POST   /api/clans/:id/applications     - Подать заявку на вступление
POST   /api/clans/:id/applications/:appId/approve  - Одобрить заявку (owner only)
POST   /api/clans/:id/applications/:appId/reject   - Отклонить заявку (owner only)
```

**POST /api/clans/:id/applications** - Подать заявку
```json
Request Body:
{
  "playerName": "Rookie_One",
  "playerSteamId": "STEAM_0:1:12345678",
  "message": "Хочу в крутой клан, играю каждый день!",
  "statsSnapshot": {
    "games": 50,
    "hours": "5д 0ч",
    "kills": 150,
    "deaths": 130,
    "kd": 1.15,
    "winrate": 45
  }
}

Response 201:
{
  "application": { /* created application */ }
}
```

#### 2.4 Squad Statistics (MongoDB Integration)
```
GET    /api/stats/:steamId             - Получить Squad статистику игрока
```

**GET /api/stats/:steamId** - Читает из MongoDB
```json
Response 200:
{
  "steamId": "STEAM_0:1:12345678",
  "name": "TacticalViper",
  "kills": 1245,
  "deaths": 892,
  "kd": 1.4,
  "matches": {
    "matches": 178,
    "won": 88,
    "winrate": 49.44
  },
  "playtime": "342ч",
  "rank": {
    "current": {
      "iconUrl": "https://...",
      "needScore": 10000
    },
    "progress": 54.2
  },
  "topWeapon": {
    "name": "M4A1",
    "kills": 245
  },
  "topRole": {
    "name": "Rifleman",
    "time": "90ч"
  }
}
```

---

## 3. Storage Interface (server/storage.ts)

### Расширение IStorage интерфейса

```typescript
export interface IStorage {
  // === PLAYERS ===
  getPlayerBySteamId(steamId: string): Promise<Player | undefined>;
  upsertPlayer(data: { steamId: string; username: string; discordId?: string }): Promise<Player>;
  
  // === CLANS ===
  listClans(): Promise<Clan[]>;
  getClanById(clanId: string): Promise<Clan | undefined>;
  createClan(data: InsertClan, ownerId: string): Promise<Clan>; // Creates clan + owner member
  updateClanSettings(clanId: string, data: UpdateClanSettings): Promise<Clan>;
  
  // === CLAN MEMBERS ===
  getClanMembers(clanId: string): Promise<ClanMember[]>;
  addClanMember(data: InsertClanMember): Promise<ClanMember>;
  removeClanMember(memberId: string): Promise<void>;
  
  // === APPLICATIONS ===
  listApplicationsByClan(clanId: string): Promise<ClanApplication[]>;
  createApplication(data: InsertClanApplication): Promise<ClanApplication>;
  approveApplication(applicationId: string): Promise<{ application: ClanApplication; member: ClanMember }>;
  rejectApplication(applicationId: string): Promise<ClanApplication>;
}
```

---

## 4. MongoDB Integration (server/services/squadStats.ts)

### Environment Variables
```
MONGO_URI=mongodb://username:password@host:port/database
MONGO_DB=squadjs
MONGO_COLLECTION=mainstats
```

### Service Implementation
```typescript
import { MongoClient } from 'mongodb';

export class SquadStatsService {
  private client: MongoClient;
  private dbName: string;
  private collectionName: string;
  
  constructor() {
    const mongoUri = process.env.MONGO_URI || '';
    this.dbName = process.env.MONGO_DB || 'squadjs';
    this.collectionName = process.env.MONGO_COLLECTION || 'mainstats';
    this.client = new MongoClient(mongoUri);
  }
  
  async getPlayerStats(steamId: string): Promise<any> {
    // Read from MongoDB and normalize data
    // Fallback to mock data if connection fails
  }
}
```

---

## 5. Авторизация (stub для будущей интеграции)

Для текущей реализации авторизация будет stub-заглушкой. В будущем интегрируется Steam OAuth или Discord OAuth.

```typescript
// server/middleware/auth.ts
export function requireAuth(req, res, next) {
  // TODO: Implement actual auth
  req.user = { id: 'uuid', steamId: 'STEAM_0:1:12345678', role: 'member' };
  next();
}
```

---

## 6. План реализации (пошаговый)

### Шаг 1: Расширить shared/schema.ts
- [ ] Добавить таблицы: players, clans, clan_members, clan_applications
- [ ] Создать Zod схемы для валидации
- [ ] Экспортировать типы

### Шаг 2: Обновить server/storage.ts
- [ ] Расширить IStorage интерфейс
- [ ] Реализовать методы в PostgresStorage (с Drizzle ORM)
- [ ] Добавить транзакции для approveApplication

### Шаг 3: Создать Squad Stats Service
- [ ] Файл server/services/squadStats.ts
- [ ] MongoDB клиент и подключение
- [ ] Метод getPlayerStats с нормализацией данных
- [ ] Fallback на mock данные

### Шаг 4: Реализовать API routes
- [ ] Clans endpoints (CRUD)
- [ ] Members endpoints
- [ ] Applications endpoints
- [ ] Stats proxy endpoint

### Шаг 5: Тестирование
- [ ] Создать seed data для разработки
- [ ] Протестировать все endpoints
- [ ] Проверить валидацию Zod

### Шаг 6: Документация
- [ ] API Reference
- [ ] Примеры запросов
- [ ] Инструкции по интеграции

---

## 7. Интеграция с фронтендом

### Замена mock данных на API calls

**Текущее состояние**: Все данные захардкожены в profile.jsx
**Целевое состояние**: Использовать TanStack Query для API запросов

### Пример миграции
```typescript
// До (mock)
const [clans, setClans] = useState([...hardcoded data...]);

// После (API)
import { useQuery } from '@tanstack/react-query';

const { data: clans, isLoading } = useQuery({
  queryKey: ['clans'],
  queryFn: async () => {
    const res = await fetch('/api/clans');
    return res.json();
  }
});
```

---

## 8. Environment Variables Summary

```env
# PostgreSQL (Neon)
DATABASE_URL=postgresql://user:password@host/database

# MongoDB (SquadJS - Read Only)
MONGO_URI=mongodb://username:password@host:port/squadjs
MONGO_DB=squadjs
MONGO_COLLECTION=mainstats

# Optional: Auth (future)
STEAM_API_KEY=your_steam_api_key
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
```

---

## 9. Преимущества этого подхода

✅ **Модульность**: Бекэнд работает независимо от основного проекта
✅ **Минимальная схема**: Только необходимые поля без избыточности
✅ **Безопасность**: Read-only доступ к MongoDB, данные приложения изолированы
✅ **Масштабируемость**: Storage interface позволяет легко добавить кеширование/оптимизацию
✅ **Типобезопасность**: Drizzle + Zod обеспечивают end-to-end type safety
✅ **Легкая интеграция**: REST API совместим с любым фронтендом

---

## Следующие шаги

1. ✅ **Создан план** - Документация готова
2. **Реализация схемы** - Расширить shared/schema.ts
3. **Storage layer** - Реализовать методы в storage.ts
4. **API routes** - Создать endpoints
5. **MongoDB service** - Настроить чтение из SquadJS
6. **Тестирование** - Проверить всё работает
7. **Интеграция** - Подключить фронтенд

**Документация готова к реализации!**
