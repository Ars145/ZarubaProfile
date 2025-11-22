# ZARUBA Backend Module - Руководство по Интеграции

## 📦 Описание Модуля

Это автономный бэкенд-модуль для управления кланами, игроками и заявками в системе ZARUBA. Модуль разработан для легкой интеграции в любой Express.js проект.

### Основные Возможности

- ✅ **Управление игроками** - профили с привязкой к Steam ID и Discord
- ✅ **Система кланов** - создание, настройка, удаление кланов
- ✅ **Заявки на вступление** - обработка заявок с автоматической статистикой
- ✅ **Члены кланов** - управление составом и ролями
- ✅ **Интеграция со статистикой Squad** - чтение из MongoDB (опционально)
- ✅ **Валидация данных** - Zod схемы для безопасности
- ✅ **Двойной storage** - PostgreSQL или In-Memory (для разработки)

---

## 🗂️ Структура Модуля

```
zaruba-backend/
├── shared/
│   └── schema.js               # Drizzle схемы + Zod валидация
├── server/
│   ├── storage.js              # Storage интерфейс (PostgreSQL + In-Memory)
│   ├── routes.js               # API endpoints
│   └── services/
│       └── squadStats.js       # Интеграция с MongoDB статистикой
└── BACKEND_MODULE_README.md    # Это руководство
```

---

## 🚀 Быстрый Старт

### Шаг 1: Копирование Файлов

Скопируйте следующие файлы в ваш проект:

```bash
# Скопировать shared схемы
cp -r zaruba-backend/shared your-project/backend/shared

# Скопировать server файлы
cp -r zaruba-backend/server your-project/backend/server
```

### Шаг 2: Установка Зависимостей

```bash
npm install drizzle-orm drizzle-zod pg zod mongodb
```

### Шаг 3: Настройка Environment Variables

Создайте `.env` файл:

```env
# PostgreSQL (обязательно для production)
DATABASE_URL=postgresql://user:password@host:5432/database

# MongoDB - SquadJS Stats (опционально)
MONGO_URI=mongodb://user:password@host:27017/
MONGO_DB=squadjs
MONGO_COLLECTION=mainstats
```

### Шаг 4: Применение Миграций

```bash
# Создать миграцию
npx drizzle-kit generate:pg --schema=./backend/shared/schema.js

# Применить миграцию
npx drizzle-kit push:pg
```

### Шаг 5: Интеграция в Express App

```javascript
// server/index.js
import express from 'express';
import { registerRoutes } from './backend/server/routes.js';

const app = express();
app.use(express.json());

// Регистрируем routes
await registerRoutes(app);

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
```

---

## 📡 API Endpoints

### Players

| Метод | Endpoint | Описание |
|-------|----------|----------|
| `POST` | `/api/players` | Создать/обновить игрока |
| `GET` | `/api/players/:steamId` | Получить игрока по Steam ID |

### Clans

| Метод | Endpoint | Описание |
|-------|----------|----------|
| `GET` | `/api/clans` | Список всех кланов |
| `GET` | `/api/clans/:id` | Детали клана |
| `POST` | `/api/clans` | Создать клан |
| `PATCH` | `/api/clans/:id` | Обновить настройки клана |
| `DELETE` | `/api/clans/:id` | Удалить клан |

### Clan Members

| Метод | Endpoint | Описание |
|-------|----------|----------|
| `GET` | `/api/clans/:id/members` | Список членов клана |
| `POST` | `/api/clans/:id/members` | Добавить члена в клан |
| `DELETE` | `/api/clans/:clanId/members/:memberId` | Удалить члена |

### Applications

| Метод | Endpoint | Описание |
|-------|----------|----------|
| `GET` | `/api/clans/:id/applications` | Список заявок (фильтр: ?status=pending) |
| `POST` | `/api/clans/:id/applications` | Подать заявку |
| `POST` | `/api/applications/:id/approve` | Одобрить заявку |
| `POST` | `/api/applications/:id/reject` | Отклонить заявку |

### Stats (MongoDB Integration)

| Метод | Endpoint | Описание |
|-------|----------|----------|
| `GET` | `/api/stats/:steamId` | Получить статистику игрока из MongoDB |

---

## 🔧 Примеры Использования

### Создать Клан

```javascript
POST /api/clans
Content-Type: application/json

{
  "name": "Отряд Альфа",
  "tag": "ALPHA",
  "description": "Элитный тактический отряд",
  "theme": "orange",
  "bannerUrl": "https://example.com/banner.png",
  "logoUrl": "https://example.com/logo.png",
  "requirements": {
    "microphone": true,
    "ageRestriction": true,
    "customRequirement": "100ч+ игрового времени"
  },
  "ownerId": "player-uuid-или-steam-id"
}
```

**Response:**
```json
{
  "id": "clan-uuid",
  "name": "Отряд Альфа",
  "tag": "ALPHA",
  ...
}
```

### Подать Заявку в Клан

```javascript
POST /api/clans/:clanId/applications
Content-Type: application/json

{
  "playerSteamId": "STEAM_0:1:12345678",
  "message": "Хочу вступить в ваш клан! Играю каждый день."
}
```

Заявка автоматически обогащается статистикой из MongoDB (если настроено).

**Response:**
```json
{
  "id": "app-uuid",
  "clanId": "clan-uuid",
  "playerName": "TacticalViper",
  "playerSteamId": "STEAM_0:1:12345678",
  "message": "Хочу вступить...",
  "status": "pending",
  "statsSnapshot": {
    "games": 178,
    "kills": 1245,
    "deaths": 892,
    "kd": 1.4,
    ...
  }
}
```

### Одобрить Заявку

```javascript
POST /api/applications/:applicationId/approve
```

**Что происходит:**
1. Создается игрок (если не существует)
2. Добавляется в clan_members с ролью "member"
3. Обновляется currentClanId у игрока
4. Статус заявки → "accepted"

**Response:**
```json
{
  "application": { ... },
  "member": { ... }
}
```

---

## 🗃️ Схема Базы Данных

### Таблица: `players`

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | UUID | Primary Key |
| `steamId` | TEXT | Steam ID (уникальный) |
| `username` | TEXT | Игровое имя |
| `discordId` | TEXT | Discord ID (nullable) |
| `currentClanId` | UUID | Текущий клан (FK → clans.id) |

### Таблица: `clans`

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | UUID | Primary Key |
| `name` | TEXT | Название клана |
| `tag` | TEXT | Тег клана (уникальный) |
| `description` | TEXT | Описание |
| `theme` | TEXT | Цветовая тема: orange\|blue\|yellow |
| `bannerUrl` | TEXT | URL баннера (nullable) |
| `logoUrl` | TEXT | URL логотипа (nullable) |
| `requirements` | JSONB | Требования к вступлению |
| `createdAt` | TIMESTAMP | Дата создания |

### Таблица: `clan_members`

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | UUID | Primary Key |
| `clanId` | UUID | FK → clans.id (CASCADE) |
| `playerId` | UUID | FK → players.id (CASCADE) |
| `role` | TEXT | Роль: owner\|member |
| `statsSnapshot` | JSONB | Снимок статистики при вступлении |
| `joinedAt` | TIMESTAMP | Дата вступления |

**Constraint:** UNIQUE(clanId, playerId)

### Таблица: `clan_applications`

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | UUID | Primary Key |
| `clanId` | UUID | FK → clans.id (CASCADE) |
| `playerName` | TEXT | Имя игрока |
| `playerSteamId` | TEXT | Steam ID игрока |
| `message` | TEXT | Сопроводительное письмо |
| `status` | TEXT | pending\|accepted\|rejected |
| `statsSnapshot` | JSONB | Статистика на момент подачи |
| `createdAt` | TIMESTAMP | Дата подачи |

---

## 🔌 Интеграция с MongoDB (Squad Stats)

### Настройка

Модуль поддерживает чтение статистики из MongoDB базы SquadJS.

**1. Настроить переменные окружения:**

```env
MONGO_URI=mongodb://user:password@host:27017/
MONGO_DB=squadjs
MONGO_COLLECTION=mainstats
```

**2. Структура данных MongoDB:**

```javascript
// Collection: mainstats
{
  _id: "STEAM_0:1:12345678",  // Steam ID
  name: "TacticalViper",
  kills: 1245,
  death: 892,
  kd: 1.4,
  matches: {
    matches: 178,
    won: 88,
    winrate: 49.44
  },
  squad: {
    timeplayed: 20520,  // минуты
    leader: 4027,       // минуты
    cmd: 1260           // минуты
  },
  weapons: { ... },
  roles: { ... },
  possess: { ... },
  scoreGroups: { ... }
}
```

**3. API Endpoint:**

```javascript
GET /api/stats/STEAM_0:1:12345678
```

**Response:**
```json
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
  "squadLeaderTime": "4д 7ч",
  "commanderTime": "21ч",
  "vehicleTime": {
    "heavy": "15ч",
    "heli": "30м"
  },
  "vehicleKills": 9,
  "knifeKills": 3,
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

## 🛠️ Кастомизация

### Добавить Новые Поля в Клан

```javascript
// shared/schema.js
export const clans = pgTable("clans", {
  // ... существующие поля
  customField: text("custom_field"),  // добавить
});

// Обновить Zod схему
export const insertClanSchema = createInsertSchema(clans, {
  // ...
  customField: z.string().optional(),
});
```

### Изменить Storage Логику

```javascript
// server/storage.js
export class PostgresStorage {
  // Переопределить метод
  async createClan(data, ownerId) {
    // Ваша логика
  }
}
```

### Добавить Middleware

```javascript
// server/index.js
import { registerRoutes } from './backend/server/routes.js';

// Middleware аутентификации
app.use('/api/clans', requireAuth);

// Регистрация routes
await registerRoutes(app);
```

---

## 🧪 Тестирование

### In-Memory Storage (без БД)

Если `DATABASE_URL` не установлен, модуль автоматически использует in-memory storage:

```javascript
// Без DATABASE_URL в .env
// Storage будет работать в памяти
```

Удобно для:
- Разработки без настройки PostgreSQL
- Unit-тестов
- Прототипирования

### Пример Теста

```javascript
import { storage } from './server/storage.js';

test('should create clan', async () => {
  const player = await storage.upsertPlayer({
    steamId: 'STEAM_0:1:123',
    username: 'TestPlayer'
  });

  const clan = await storage.createClan({
    name: 'Test Clan',
    tag: 'TEST',
    description: 'Test',
    theme: 'orange',
    requirements: {}
  }, player.id);

  expect(clan.name).toBe('Test Clan');
});
```

---

## 🚨 Troubleshooting

### Проблема: "Cannot connect to database"

**Решение:**
```bash
# Проверить DATABASE_URL
echo $DATABASE_URL

# Проверить подключение
psql $DATABASE_URL
```

### Проблема: "Player not found in stats database"

**Решение:**
- Проверьте что MONGO_URI настроен
- Убедитесь что Steam ID правильный
- Проверьте что MongoDB доступна

### Проблема: "Clan with this tag already exists"

**Решение:**
- Теги кланов должны быть уникальными
- Используйте другой тег или удалите существующий клан

---

## 📚 Дополнительная Документация

- **BACKEND_PLAN.md** - детальный план архитектуры
- **DATABASE_DETAILED_SPEC.md** - полная спецификация БД
- **MONGODB_STATS_PLAN.md** - интеграция со статистикой Squad
- **INTEGRATION_GUIDE.md** - расширенное руководство

---

## 🔐 Безопасность

### Рекомендации

1. **Валидация данных** - все endpoints используют Zod схемы
2. **SQL Injection** - Drizzle ORM защищает от инъекций
3. **Аутентификация** - добавьте middleware для защиты endpoints
4. **CORS** - настройте CORS для production
5. **Rate Limiting** - добавьте ограничения запросов

### Пример Middleware Аутентификации

```javascript
// server/middleware/auth.js
export function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Проверка токена
  const user = verifyToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  req.userId = user.id;
  next();
}

// В routes.js
import { requireAuth } from './middleware/auth.js';

app.post('/api/clans', requireAuth, async (req, res) => {
  // ...
});
```

---

## 🎯 Best Practices

### 1. Транзакции для Критических Операций

```javascript
// Одобрение заявки - всегда в транзакции
await db.transaction(async (tx) => {
  // 1. Создать игрока
  // 2. Добавить в clan_members
  // 3. Обновить application status
  // 4. Обновить player.currentClanId
});
```

### 2. Валидация на Уровне API

```javascript
try {
  const data = insertClanSchema.parse(req.body);
  // ...
} catch (error) {
  return res.status(400).json({
    error: 'Validation failed',
    details: error.errors
  });
}
```

### 3. Обработка Ошибок

```javascript
try {
  const clan = await storage.getClanById(req.params.id);
  if (!clan) {
    return res.status(404).json({ error: 'Clan not found' });
  }
  res.json(clan);
} catch (error) {
  console.error('Error fetching clan:', error);
  res.status(500).json({ error: 'Internal server error' });
}
```

---

## 📈 Производительность

### Индексы (автоматически создаются Drizzle)

- `players.steamId` - UNIQUE INDEX
- `clans.tag` - UNIQUE INDEX
- `clan_members(clanId, playerId)` - UNIQUE INDEX

### Connection Pooling

```javascript
// server/storage.js
const pool = new Pool({
  connectionString: poolUrl,
  max: 10,  // максимум 10 соединений
});
```

---

## 🤝 Contributing

Если вы используете этот модуль и хотите улучшить его:

1. Форкните репозиторий
2. Создайте feature branch
3. Сделайте изменения
4. Отправьте pull request

---

## 📝 Changelog

### v1.0.0 (2024-11-22)
- ✅ Первая версия модуля
- ✅ PostgreSQL + In-Memory storage
- ✅ REST API для кланов, игроков, заявок
- ✅ MongoDB интеграция для статистики
- ✅ Zod валидация

---

## 📄 License

MIT License - используйте свободно в своих проектах

---

## 💬 Поддержка

Если есть вопросы по интеграции модуля:

1. Прочитайте INTEGRATION_GUIDE.md
2. Проверьте примеры в этом README
3. Изучите код в server/routes.js и server/storage.js

---

**Готово к использованию!** 🎉

Модуль полностью автономный и готов к интеграции в любой Express.js проект. Следуйте Быстрому Старту и через 10 минут у вас будет работающий бэкенд для управления кланами.
