# План Бэкенда для Компонента Профиля и Кланов ZARUBA

## 📋 Оглавление
1. [Обзор](#обзор)
2. [Текущее Состояние Проекта](#текущее-состояние-проекта)
3. [Структура Данных](#структура-данных)
4. [API Endpoints](#api-endpoints)
5. [План Реализации](#план-реализации)
6. [Интеграция в Основной Проект](#интеграция-в-основной-проект)

---

## 🎯 Обзор

### Цель
Создать частичный бэкенд для компонента профиля игрока и управления кланами, который можно легко интегрировать в основной проект ZARUBA.

### Что Будет Реализовано
- ✅ REST API для управления профилями игроков
- ✅ REST API для управления кланами
- ✅ REST API для обработки заявок в кланы
- ✅ PostgreSQL схема базы данных
- ✅ Drizzle ORM интеграция
- ✅ TypeScript типы для всех сущностей

### Что НЕ Будет Реализовано
- ❌ Полная аутентификация (предполагается интеграция с основным проектом)
- ❌ Steam API интеграция (mock данные для демонстрации)
- ❌ Discord OAuth (только хранение Discord ID и ссылок)
- ❌ Websocket для real-time обновлений статуса игроков
- ❌ Система достижений (hardcoded на фронтенде)

---

## 📊 Текущее Состояние Проекта

### Фронтенд Компоненты (Готово)
```
client/src/pages/profile.jsx - Основная страница профиля
├── Роли пользователей: Guest, Member, Owner
├── Управление кланами (Owner)
├── Просмотр состава клана (Member/Owner)
├── Поиск и заявки в кланы (Guest)
└── Настройки профиля и клана
```

### Mock Данные на Фронтенде (Требуют API)

#### 1. **Профиль Игрока**
```javascript
{
  username: "TacticalViper",
  level: 52,
  xp: 68,
  avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=TacticalViper",
  isVip: false,
  steamId: "STEAM_0:1:12345678",
  discordId: "TacticalViper#9999",
  status: "online" | "offline" | "in_game"
}
```

#### 2. **Статистика Игрока**
```javascript
{
  kills: 1245,
  deaths: 892,
  kd: 1.42,
  playtime: "342ч",
  games: 178,
  hours: "6д 20ч",
  sl: "4д 7ч",        // Squad Leader time
  driver: "2ч",        // Driver time
  pilot: "0",          // Pilot time
  cmd: "21ч",          // Commander time
  likes: 82,           // Teamwork points
  tk: 39,              // Team kills
  winrate: 49,         // Win percentage
  wins: 88,
  avgKills: 1,
  vehicleKills: 9,
  knifeKills: 0
}
```

#### 3. **Клан**
```javascript
{
  id: "alpha",
  name: "Отряд Альфа",
  tag: "ALPHA",
  members: 5,
  maxMembers: 50,
  level: 5,
  requirements: "100ч+, KD > 1.0",
  description: "Элитный отряд для опытных игроков...",
  bannerUrl: "/path/to/banner.png",
  logoUrl: "/path/to/logo.png",
  discordLink: "https://discord.gg/clan-alpha",
  winrate: 68,
  ownerId: "uuid-owner"
}
```

#### 4. **Член Клана**
```javascript
{
  id: 1,
  userId: "user-uuid",
  clanId: "alpha",
  name: "TacticalViper",
  role: "Офицер" | "Боец" | "Рекрут",
  status: "В ИГРЕ" | "В СЕТИ" | "НЕ В СЕТИ",
  joinedAt: "2024-01-15T10:00:00Z",
  stats: { /* player stats */ }
}
```

#### 5. **Заявка в Клан**
```javascript
{
  id: 101,
  applicantId: "user-uuid",
  clanId: "alpha",
  name: "Rookie_One",
  message: "Хочу в крутой клан, играю каждый день!",
  createdAt: "2024-11-20T10:00:00Z",
  status: "pending" | "accepted" | "rejected",
  stats: { /* player stats */ }
}
```

---

## 🗄️ Структура Данных

### Database Schema (PostgreSQL + Drizzle)

```typescript
// shared/schema.ts

// 1. Players Table
export const players = pgTable("players", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  steamId: text("steam_id").unique(),
  discordId: text("discord_id"),
  avatarUrl: text("avatar_url"),
  level: integer("level").default(1),
  xp: integer("xp").default(0),
  isVip: boolean("is_vip").default(false),
  status: text("status").default("offline"), // online, offline, in_game
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// 2. Player Stats Table
export const playerStats = pgTable("player_stats", {
  playerId: varchar("player_id").references(() => players.id).primaryKey(),
  kills: integer("kills").default(0),
  deaths: integer("deaths").default(0),
  wins: integer("wins").default(0),
  games: integer("games").default(0),
  playtimeMinutes: integer("playtime_minutes").default(0),
  squadLeaderMinutes: integer("squad_leader_minutes").default(0),
  driverMinutes: integer("driver_minutes").default(0),
  pilotMinutes: integer("pilot_minutes").default(0),
  commanderMinutes: integer("commander_minutes").default(0),
  likes: integer("likes").default(0),
  teamKills: integer("team_kills").default(0),
  vehicleKills: integer("vehicle_kills").default(0),
  knifeKills: integer("knife_kills").default(0)
});

// 3. Clans Table
export const clans = pgTable("clans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  tag: text("tag").notNull().unique(),
  ownerId: varchar("owner_id").references(() => players.id).notNull(),
  description: text("description"),
  requirements: text("requirements"),
  bannerUrl: text("banner_url"),
  logoUrl: text("logo_url"),
  discordLink: text("discord_link"),
  level: integer("level").default(1),
  maxMembers: integer("max_members").default(50),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// 4. Clan Members Table
export const clanMembers = pgTable("clan_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clanId: varchar("clan_id").references(() => clans.id).notNull(),
  playerId: varchar("player_id").references(() => players.id).notNull(),
  role: text("role").default("Рекрут"), // Офицер, Боец, Рекрут
  joinedAt: timestamp("joined_at").defaultNow()
});

// 5. Clan Applications Table
export const clanApplications = pgTable("clan_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clanId: varchar("clan_id").references(() => clans.id).notNull(),
  playerId: varchar("player_id").references(() => players.id).notNull(),
  message: text("message").notNull(),
  status: text("status").default("pending"), // pending, accepted, rejected
  createdAt: timestamp("created_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: varchar("reviewed_by").references(() => players.id)
});
```

### TypeScript Types
```typescript
export type Player = typeof players.$inferSelect;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;

export type PlayerStats = typeof playerStats.$inferSelect;
export type InsertPlayerStats = z.infer<typeof insertPlayerStatsSchema>;

export type Clan = typeof clans.$inferSelect;
export type InsertClan = z.infer<typeof insertClanSchema>;

export type ClanMember = typeof clanMembers.$inferSelect;
export type InsertClanMember = z.infer<typeof insertClanMemberSchema>;

export type ClanApplication = typeof clanApplications.$inferSelect;
export type InsertClanApplication = z.infer<typeof insertClanApplicationSchema>;
```

---

## 🔌 API Endpoints

### Base URL
```
/api
```

### Authentication
Все эндпоинты (кроме public) требуют header:
```
Authorization: Bearer <token>
```
**Примечание:** Аутентификация будет реализована в основном проекте. Для демо можно использовать фиктивный middleware.

---

### 📱 Players API

#### `GET /api/players/me`
Получить профиль текущего игрока

**Response:**
```json
{
  "player": {
    "id": "uuid",
    "username": "TacticalViper",
    "steamId": "STEAM_0:1:12345678",
    "discordId": "TacticalViper#9999",
    "avatarUrl": "https://...",
    "level": 52,
    "xp": 6800,
    "isVip": false,
    "status": "online"
  },
  "stats": {
    "kills": 1245,
    "deaths": 892,
    "kd": 1.42,
    "wins": 88,
    "games": 178,
    "winrate": 49.44,
    "playtime": "342ч",
    // ... остальные статы
  },
  "clan": {
    "id": "alpha",
    "name": "Отряд Альфа",
    "tag": "ALPHA",
    "role": "Офицер"
  } | null
}
```

#### `PATCH /api/players/me`
Обновить профиль игрока

**Request Body:**
```json
{
  "username": "NewUsername",
  "avatarUrl": "https://...",
  "discordId": "NewDiscord#1234"
}
```

**Response:**
```json
{
  "player": { /* updated player */ }
}
```

#### `GET /api/players/:id`
Получить публичный профиль игрока

**Response:**
```json
{
  "player": { /* player info */ },
  "stats": { /* player stats */ },
  "clan": { /* clan info or null */ }
}
```

---

### 🛡️ Clans API

#### `GET /api/clans`
Получить список всех кланов

**Query Params:**
- `search` - поиск по названию/тегу
- `limit` - количество результатов (default: 50)
- `offset` - смещение для пагинации

**Response:**
```json
{
  "clans": [
    {
      "id": "alpha",
      "name": "Отряд Альфа",
      "tag": "ALPHA",
      "description": "...",
      "requirements": "100ч+, KD > 1.0",
      "members": 5,
      "maxMembers": 50,
      "level": 5,
      "bannerUrl": "...",
      "logoUrl": "...",
      "winrate": 68
    }
  ],
  "total": 3
}
```

#### `GET /api/clans/:id`
Получить детальную информацию о клане

**Response:**
```json
{
  "clan": {
    "id": "alpha",
    "name": "Отряд Альфа",
    // ... clan info
  },
  "owner": {
    "id": "uuid",
    "username": "CommanderX"
  },
  "members": [
    {
      "id": "member-uuid",
      "playerId": "player-uuid",
      "username": "TacticalViper",
      "role": "Офицер",
      "status": "online",
      "stats": { /* player stats */ }
    }
  ],
  "stats": {
    "totalMembers": 5,
    "onlineMembers": 3,
    "avgKD": 1.2,
    "winrate": 68
  }
}
```

#### `POST /api/clans`
Создать новый клан (Owner only)

**Request Body:**
```json
{
  "name": "Новый Клан",
  "tag": "NEW",
  "description": "Описание",
  "requirements": "50ч+",
  "bannerUrl": "https://...",
  "logoUrl": "https://...",
  "discordLink": "https://discord.gg/..."
}
```

**Response:**
```json
{
  "clan": { /* created clan */ }
}
```

#### `PATCH /api/clans/:id`
Обновить настройки клана (Owner only)

**Request Body:**
```json
{
  "description": "Новое описание",
  "requirements": "100ч+",
  "bannerUrl": "https://...",
  "logoUrl": "https://...",
  "discordLink": "https://discord.gg/..."
}
```

#### `DELETE /api/clans/:id`
Удалить клан (Owner only)

---

### 👥 Clan Members API

#### `GET /api/clans/:clanId/members`
Получить список членов клана

**Query Params:**
- `sortBy` - сортировка: `kd`, `hours`, `winrate`, `kills`, `default`

**Response:**
```json
{
  "members": [
    {
      "id": "member-uuid",
      "playerId": "player-uuid",
      "username": "TacticalViper",
      "role": "Офицер",
      "status": "online",
      "joinedAt": "2024-01-15T10:00:00Z",
      "stats": { /* player stats */ }
    }
  ]
}
```

#### `PATCH /api/clans/:clanId/members/:memberId`
Изменить роль члена клана (Owner/Officers only)

**Request Body:**
```json
{
  "role": "Офицер" | "Боец" | "Рекрут"
}
```

#### `DELETE /api/clans/:clanId/members/:memberId`
Удалить члена из клана (Owner/Officers only)

#### `POST /api/clans/:clanId/leave`
Покинуть клан

---

### 📝 Clan Applications API

#### `GET /api/clans/:clanId/applications`
Получить заявки в клан (Owner only)

**Response:**
```json
{
  "applications": [
    {
      "id": "app-uuid",
      "player": {
        "id": "player-uuid",
        "username": "Rookie_One",
        "avatarUrl": "..."
      },
      "message": "Хочу в крутой клан!",
      "status": "pending",
      "createdAt": "2024-11-20T10:00:00Z",
      "stats": { /* player stats */ }
    }
  ]
}
```

#### `POST /api/clans/:clanId/apply`
Подать заявку в клан

**Request Body:**
```json
{
  "message": "Хочу вступить в клан потому что..."
}
```

**Response:**
```json
{
  "application": { /* created application */ }
}
```

#### `POST /api/clans/:clanId/applications/:appId/accept`
Принять заявку (Owner only)

**Response:**
```json
{
  "member": { /* new clan member */ }
}
```

#### `POST /api/clans/:clanId/applications/:appId/reject`
Отклонить заявку (Owner only)

---

## 🚀 План Реализации

### Этап 1: Database Schema (Приоритет: ВЫСОКИЙ)
- [ ] Создать миграцию для всех таблиц
- [ ] Добавить индексы для производительности
- [ ] Создать Zod схемы для валидации
- [ ] Экспортировать TypeScript типы

**Файлы:**
- `shared/schema.ts` - основные схемы
- `drizzle/migrations/` - миграции БД

### Этап 2: Storage Interface (Приоритет: ВЫСОКИЙ)
- [ ] Расширить `IStorage` интерфейс
- [ ] Реализовать методы для работы с Players
- [ ] Реализовать методы для работы с Clans
- [ ] Реализовать методы для работы с Applications
- [ ] Добавить транзакции для критичных операций

**Файлы:**
- `server/storage.ts`

### Этап 3: API Routes (Приоритет: СРЕДНИЙ)
- [ ] Players endpoints
- [ ] Clans endpoints
- [ ] Clan Members endpoints
- [ ] Applications endpoints
- [ ] Error handling middleware
- [ ] Request validation

**Файлы:**
- `server/routes.ts`

### Этап 4: Frontend Integration (Приоритет: СРЕДНИЙ)
- [ ] Создать API клиент (fetch wrapper)
- [ ] Заменить mock данные на API calls
- [ ] Добавить TanStack Query для кеширования
- [ ] Обработка ошибок и loading states

**Файлы:**
- `client/src/lib/api.ts` - новый файл
- `client/src/pages/profile.jsx` - обновить

### Этап 5: Testing & Demo Data (Приоритет: НИЗКИЙ)
- [ ] Seed скрипт для тестовых данных
- [ ] Тестирование основных сценариев
- [ ] Документация API (Swagger/OpenAPI)

---

## 🔗 Интеграция в Основной Проект

### Что Нужно от Основного Проекта

#### 1. Аутентификация
```typescript
// Middleware для получения текущего пользователя
app.use('/api', async (req, res, next) => {
  // Ваша логика аутентификации
  const userId = await getUserIdFromToken(req.headers.authorization);
  req.userId = userId; // Добавить userId в request
  next();
});
```

#### 2. Steam API Integration (опционально)
```typescript
// Синхронизация статистики с Steam
async function syncPlayerStats(steamId: string) {
  // Логика получения статистики из Steam API
  // Обновление в базе через storage.updatePlayerStats()
}
```

#### 3. Discord Integration (опционально)
```typescript
// Discord OAuth callback
app.get('/auth/discord/callback', async (req, res) => {
  const discordId = /* получить из Discord */;
  await storage.updatePlayer(userId, { discordId });
});
```

### Как Использовать API

#### Пример: Получение профиля
```typescript
// Frontend
const { data, isLoading } = useQuery({
  queryKey: ['profile'],
  queryFn: async () => {
    const res = await fetch('/api/players/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return res.json();
  }
});
```

#### Пример: Подача заявки в клан
```typescript
// Frontend
const applyMutation = useMutation({
  mutationFn: async ({ clanId, message }) => {
    const res = await fetch(`/api/clans/${clanId}/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ message })
    });
    return res.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries(['applications']);
  }
});
```

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/zaruba

# Optional
STEAM_API_KEY=your_steam_api_key
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
```

---

## 📝 Дополнительные Заметки

### Безопасность
- Все эндпоинты требуют аутентификации (кроме public)
- Валидация входных данных через Zod
- Rate limiting для API (рекомендуется)
- SQL injection защита через Drizzle ORM

### Производительность
- Индексы на часто используемых полях
- Пагинация для списков
- Кеширование на фронтенде через TanStack Query
- N+1 queries решаются через JOIN

### Масштабируемость
- Архитектура позволяет добавить Redis для кеширования
- Возможность добавить WebSocket для real-time
- Микросервисная архитектура (при необходимости)

### Будущие Улучшения
- [ ] Система достижений
- [ ] Турниры и рейтинги
- [ ] Clan Wars (войны кланов)
- [ ] Детальная статистика по картам
- [ ] История матчей
- [ ] Clan chat через WebSocket

---

## ✅ Checklist для Интеграции

- [ ] Настроить PostgreSQL базу данных
- [ ] Запустить миграции
- [ ] Настроить environment variables
- [ ] Добавить middleware аутентификации
- [ ] Протестировать все endpoints
- [ ] Обновить frontend для использования API
- [ ] Добавить обработку ошибок
- [ ] Настроить CORS если необходимо
- [ ] Задокументировать изменения

---

**Автор:** Replit Agent  
**Дата создания:** 20 ноября 2024  
**Версия:** 1.0.0
