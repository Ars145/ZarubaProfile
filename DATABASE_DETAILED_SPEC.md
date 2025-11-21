# Детальная спецификация базы данных ZARUBA

## Обзор архитектуры данных

```
┌─────────────────────────────────────────────────────────────┐
│                    ZARUBA Data Layer                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  PostgreSQL (Application Data)    MongoDB (Game Stats)     │
│  ┌──────────────────────┐         ┌──────────────────┐    │
│  │ • players            │         │ • mainstats      │    │
│  │ • clans              │         │   (read-only)    │    │
│  │ • clan_members       │         │                  │    │
│  │ • clan_applications  │         │ • configs        │    │
│  └──────────────────────┘         │   (rank system)  │    │
│                                    └──────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## ЧАСТЬ 1: PostgreSQL Таблицы (Данные приложения)

### Таблица 1: `players` - Профили игроков

**Назначение**: Связывает Steam ID игрока с его профилем в приложении, Discord аккаунтом и текущим кланом.

**Структура**:
```typescript
{
  id: uuid                    // PK, auto-generated
  steamId: text               // UNIQUE, NOT NULL - Steam ID игрока
  username: text              // NOT NULL - Игровое имя из Squad
  discordId: text             // NULLABLE - Discord ID для привязки
  currentClanId: uuid         // FK → clans.id, NULLABLE - ID текущего клана
}
```

**Пример данных**:
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "steamId": "STEAM_0:1:12345678",
  "username": "TacticalViper",
  "discordId": "123456789012345678",
  "currentClanId": "clan-uuid-alpha"
}
```

**Зачем каждое поле**:
- `id` - внутренний UUID для связей в PostgreSQL
- `steamId` - уникальный идентификатор игрока из Squad/Steam (основной ключ поиска)
- `username` - отображаемое имя игрока (синхронизируется из MongoDB при первом входе)
- `discordId` - привязка к Discord аккаунту (для будущей OAuth авторизации)
- `currentClanId` - быстрый доступ к клану игрока без JOIN через clan_members

**Индексы**:
- PRIMARY KEY: `id`
- UNIQUE: `steamId` (быстрый поиск по Steam ID)
- INDEX: `currentClanId` (для JOIN с таблицей clans)

**Lifecycle**:
1. Игрок впервые заходит на сайт → создается запись с `steamId` и `username` из MongoDB
2. Игрок привязывает Discord → обновляется `discordId`
3. Игрок вступает в клан → обновляется `currentClanId`
4. Игрок выходит из клана → `currentClanId` устанавливается в `NULL`

---

### Таблица 2: `clans` - Информация о кланах

**Назначение**: Хранит основную информацию о клане, настройки владельца (требования, тема), визуальные элементы.

**Структура**:
```typescript
{
  id: uuid                    // PK, auto-generated
  name: text                  // NOT NULL - Название клана
  tag: text                   // UNIQUE, NOT NULL - Короткий тег клана
  description: text           // NOT NULL - Описание клана
  theme: text                 // NOT NULL, DEFAULT 'orange' - Цветовая тема
  bannerUrl: text             // NULLABLE - URL баннера клана
  logoUrl: text               // NULLABLE - URL логотипа клана
  requirements: jsonb         // NOT NULL, DEFAULT {} - Требования к вступлению
  createdAt: timestamp        // DEFAULT now() - Дата создания клана
}
```

**Пример данных**:
```json
{
  "id": "clan-uuid-alpha",
  "name": "Отряд Альфа",
  "tag": "ALPHA",
  "description": "Элитный отряд для опытных игроков. Только командная игра и тактическая координация.",
  "theme": "orange",
  "bannerUrl": "https://example.com/banners/alpha-banner.png",
  "logoUrl": "https://example.com/logos/wolf-logo.png",
  "requirements": {
    "microphone": true,
    "ageRestriction": true,
    "customRequirement": "100ч+ игрового времени"
  },
  "createdAt": "2024-01-15T10:00:00Z"
}
```

**Зачем каждое поле**:
- `id` - UUID клана
- `name` - полное название клана (отображается на карточках)
- `tag` - короткий тег (ALPHA, DF, ZE) - используется в UI для компактного отображения
- `description` - описание клана для гостей
- `theme` - цветовая тема клана ("orange" | "blue" | "yellow") - владелец может менять
- `bannerUrl` - URL изображения баннера клана (можно загружать свои или использовать дефолтные)
- `logoUrl` - URL логотипа клана (волк, орел, череп и т.д.)
- `requirements` - JSONB объект с требованиями к вступлению:
  - `microphone: boolean` - требуется ли микрофон
  - `ageRestriction: boolean` - ограничение 18+
  - `customRequirement: string` - кастомное требование (макс 30 символов)
- `createdAt` - когда клан был создан

**Валидация requirements (Zod)**:
```typescript
const requirementsSchema = z.object({
  microphone: z.boolean().default(false),
  ageRestriction: z.boolean().default(false),
  customRequirement: z.string().max(30).default("")
});
```

**Допустимые значения theme**:
- `"orange"` - оранжевая тема (дефолт для Alpha)
- `"blue"` - синяя тема (дефолт для Delta Force)
- `"yellow"` - желтая тема (дефолт для Zaruba Elite)

**Индексы**:
- PRIMARY KEY: `id`
- UNIQUE: `tag` (каждый тег уникален)

---

### Таблица 3: `clan_members` - Члены кланов

**Назначение**: Связывает игроков с кланами, хранит роли и снимок статистики на момент вступления.

**Структура**:
```typescript
{
  id: uuid                    // PK, auto-generated
  clanId: uuid                // FK → clans.id, NOT NULL, ON DELETE CASCADE
  playerId: uuid              // FK → players.id, NOT NULL, ON DELETE CASCADE
  role: text                  // NOT NULL - Роль: "owner" | "member"
  statsSnapshot: jsonb        // NULLABLE - Снимок статистики при вступлении
  joinedAt: timestamp         // DEFAULT now() - Дата вступления в клан
}
```

**CONSTRAINT**: UNIQUE(clanId, playerId) - игрок может быть только в одном клане

**Пример данных**:
```json
{
  "id": "member-uuid-1",
  "clanId": "clan-uuid-alpha",
  "playerId": "player-uuid-tactical-viper",
  "role": "owner",
  "statsSnapshot": {
    "kills": 1245,
    "deaths": 892,
    "kd": 1.4,
    "winrate": 49,
    "playtime": "342ч",
    "games": 178
  },
  "joinedAt": "2024-01-15T10:00:00Z"
}
```

**Зачем каждое поле**:
- `id` - UUID записи о членстве
- `clanId` - ссылка на клан
- `playerId` - ссылка на игрока
- `role` - роль в клане:
  - `"owner"` - владелец клана (1 на клан)
  - `"member"` - обычный член клана
- `statsSnapshot` - JSONB снимок статистики игрока на момент вступления:
  ```typescript
  {
    kills: number,        // Убийства
    deaths: number,       // Смерти
    kd: number,          // K/D ratio
    winrate: number,     // Винрейт (%)
    playtime: string,    // Время игры (форматированное)
    games: number        // Количество матчей
  }
  ```
  Зачем хранить snapshot? Чтобы владелец клана мог видеть, с какими показателями игрок вступил в клан.
- `joinedAt` - дата вступления (для истории и сортировки по стажу)

**Правила роли "owner"**:
- В каждом клане должен быть ровно 1 owner
- При создании клана создатель автоматически становится owner
- Owner может передать роль другому member (промоут)
- При удалении owner'а клан тоже удаляется (CASCADE)

**Индексы**:
- PRIMARY KEY: `id`
- UNIQUE: `(clanId, playerId)` - один игрок не может быть дважды в одном клане
- INDEX: `clanId` - для быстрого получения всех членов клана
- INDEX: `playerId` - для быстрого поиска клана игрока

---

### Таблица 4: `clan_applications` - Заявки на вступление

**Назначение**: Хранит заявки игроков на вступление в клан с прикреплённой статистикой для оценки владельцем.

**Структура**:
```typescript
{
  id: uuid                    // PK, auto-generated
  clanId: uuid                // FK → clans.id, NOT NULL, ON DELETE CASCADE
  playerName: text            // NOT NULL - Имя игрока (из Squad)
  playerSteamId: text         // NOT NULL - Steam ID игрока
  message: text               // NOT NULL - Сопроводительное письмо (max 500 chars)
  status: text                // NOT NULL, DEFAULT 'pending' - Статус заявки
  statsSnapshot: jsonb        // NOT NULL - Полная статистика игрока
  createdAt: timestamp        // DEFAULT now() - Дата подачи заявки
}
```

**Пример данных**:
```json
{
  "id": "app-uuid-1",
  "clanId": "clan-uuid-alpha",
  "playerName": "Rookie_One",
  "playerSteamId": "STEAM_0:1:99999999",
  "message": "Привет! Хочу вступить в ваш клан. Играю каждый день, есть микрофон и Discord. Готов к командной игре!",
  "status": "pending",
  "statsSnapshot": {
    "games": 50,
    "hours": "5д 0ч",
    "sl": "0ч",
    "driver": "10ч",
    "pilot": "0ч",
    "cmd": "0ч",
    "likes": 5,
    "tk": 0,
    "winrate": 45,
    "kills": 150,
    "deaths": 130,
    "kd": 1.15,
    "wins": 22,
    "avgKills": 3,
    "vehicleKills": 10,
    "knifeKills": 0
  },
  "createdAt": "2024-11-20T14:30:00Z"
}
```

**Зачем каждое поле**:
- `id` - UUID заявки
- `clanId` - в какой клан подается заявка
- `playerName` - имя игрока из Squad (на момент подачи заявки)
- `playerSteamId` - Steam ID игрока (для проверки статистики и создания профиля)
- `message` - сопроводительное письмо от игрока (макс 500 символов)
  - Валидация: минимум 1 символ, максимум 500
  - Примеры: "Хочу в крутой клан", "Ищу стак для игры на технике", "Возьмите пж"
- `status` - статус заявки:
  - `"pending"` - ожидает рассмотрения владельцем
  - `"accepted"` - принята (игрок добавлен в clan_members)
  - `"rejected"` - отклонена
- `statsSnapshot` - JSONB полная статистика игрока на момент подачи заявки:
  ```typescript
  {
    games: number,          // Количество матчей
    hours: string,          // Общее время игры (форматированное)
    sl: string,            // Время в роли Squad Leader
    driver: string,        // Время водителя техники
    pilot: string,         // Время пилота
    cmd: string,           // Время командира
    likes: number,         // Лайки от других игроков
    tk: number,            // Тимкиллы
    winrate: number,       // Винрейт (%)
    kills: number,         // Убийства
    deaths: number,        // Смерти
    kd: number,           // K/D ratio
    wins: number,         // Побед
    avgKills: number,     // Средних убийств за матч
    vehicleKills: number, // Убийств на технике
    knifeKills: number    // Убийств ножом
  }
  ```
  Зачем полная статистика? Владелец клана должен видеть детальную информацию о кандидате для принятия решения.
- `createdAt` - когда заявка была подана (для сортировки по дате)

**Workflow заявки**:
1. **Guest подает заявку**:
   - Заполняет форму на фронтенде (steamId, message)
   - Фронтенд получает статистику из `/api/stats/:steamId`
   - POST `/api/clans/:id/applications` с полными данными
   - Создается запись со статусом `"pending"`

2. **Owner просматривает заявки**:
   - GET `/api/clans/:id/applications?status=pending`
   - Видит список заявок с полной статистикой каждого кандидата

3. **Owner принимает заявку**:
   - POST `/api/clans/:id/applications/:appId/approve`
   - Транзакция:
     1. Создается запись в `clan_members` (role: "member")
     2. Обновляется `applications.status` → "accepted"
     3. Создается/обновляется запись в `players` (если игрока нет)
     4. Обновляется `players.currentClanId`

4. **Owner отклоняет заявку**:
   - POST `/api/clans/:id/applications/:appId/reject`
   - Обновляется `applications.status` → "rejected"

**Индексы**:
- PRIMARY KEY: `id`
- INDEX: `clanId, status` - для фильтрации заявок по клану и статусу
- INDEX: `createdAt DESC` - для сортировки по дате

**Валидация statsSnapshot (Zod)**:
```typescript
const statsSnapshotSchema = z.object({
  games: z.number(),
  hours: z.string(),
  sl: z.string(),
  driver: z.string(),
  pilot: z.string(),
  cmd: z.string(),
  likes: z.number(),
  tk: z.number(),
  winrate: z.number(),
  kills: z.number(),
  deaths: z.number(),
  kd: z.number(),
  wins: z.number(),
  avgKills: z.number(),
  vehicleKills: z.number(),
  knifeKills: z.number()
}).passthrough(); // allow additional fields
```

---

## ЧАСТЬ 2: MongoDB Collections (Игровая статистика SquadJS)

### Collection: `mainstats` - Статистика игроков

**Назначение**: Хранит детальную игровую статистику каждого игрока с сервера Squad (managed by SquadJS).

**Доступ**: READ-ONLY (веб-приложение только читает, не изменяет)

**Структура документа MongoDB**:
```typescript
{
  _id: string                 // Steam ID игрока (например: "STEAM_0:1:12345678")
  name: string                // Игровое имя
  
  // Основная статистика боя
  kills: number               // Всего убийств
  death: number               // Всего смертей (да, "death" а не "deaths")
  kd: number                  // K/D ratio (kills / deaths)
  revives: number             // Всего оживлений союзников
  teamkills: number           // Тимкиллы (убийства союзников)
  
  // Матчи и победы
  matches: {
    matches: number           // Всего матчей
    won: number               // Побед
    winrate: number           // Процент побед (0-100)
  }
  
  // Время игры (в МИНУТАХ!)
  squad: {
    timeplayed: number        // Общее время игры (минуты)
    leader: number            // Время в роли Squad Leader (минуты)
    cmd: number               // Время в роли Commander (минуты)
  }
  
  // Роли (время в минутах для каждой роли)
  roles: {
    [roleName: string]: number  // Например: "US_Army_Rifleman": 5420
  }
  
  // Оружие (убийства для каждого оружия)
  weapons: {
    [weaponName: string]: number  // Например: "US_Weapons_M4A1": 245
  }
  
  // Техника (время владения в СЕКУНДАХ!)
  possess: {
    [vehicleName: string]: number  // Например: "US_Vehicles_M1A2_Abrams": 3600
  }
  
  // Ранги/опыт (скоры по группам)
  scoreGroups: {
    "1": number                // Infantry score
    "2": number                // Armor score
    "3": number                // Aviation score
  }
}
```

**Реальный пример документа**:
```json
{
  "_id": "STEAM_0:1:12345678",
  "name": "TacticalViper",
  "kills": 1245,
  "death": 892,
  "kd": 1.4,
  "revives": 156,
  "teamkills": 12,
  "matches": {
    "matches": 178,
    "won": 88,
    "winrate": 49.44
  },
  "squad": {
    "timeplayed": 20520,
    "leader": 4027,
    "cmd": 1260
  },
  "roles": {
    "US_Army_Rifleman": 5420,
    "US_Army_Medic": 3210,
    "RUS_Army_AT": 2890,
    "US_Army_Grenadier": 2100,
    "RUS_Army_Marksman": 1850,
    "US_Army_MachineGunner": 1620,
    "RUS_Army_Sapper": 980,
    "US_Army_Crewman": 750,
    "RUS_Army_Pilot": 420,
    "US_Army_Squadleader": 1280
  },
  "weapons": {
    "US_Weapons_M4A1": 245,
    "US_Weapons_M249": 189,
    "RUS_Weapons_AK74": 167,
    "US_Weapons_M110": 98,
    "RUS_Weapons_PKM": 87,
    "US_Weapons_M67_Frag": 65,
    "RUS_Weapons_RPG7_Projectile_HEAT": 45,
    "US_Weapons_M2_Technical_M2": 34,
    "RUS_Weapons_DShK_Technical": 28,
    "US_Weapons_LAV25_25mm": 23,
    "RUS_Weapons_BTR82A_30mm": 19,
    "US_Weapons_M1A2_M256A1_120mm": 15,
    "US_Weapons_SOCP": 5,
    "RUS_Weapons_AK74Bayonet": 3
  },
  "possess": {
    "US_Vehicles_M1A2_Abrams": 3600,
    "RUS_Vehicles_BTR82A": 5400,
    "US_Vehicles_LAV25": 2700,
    "US_Vehicles_UH60_Blackhawk": 1800,
    "RUS_Vehicles_MI8": 900
  },
  "scoreGroups": {
    "1": 15420,
    "2": 8950,
    "3": 4230
  }
}
```

### Collection: `configs` - Конфигурация рангов

**Назначение**: Хранит настройки системы рангов (иконки, пороги опыта).

**Структура документа**:
```json
{
  "type": "score",
  "icons": {
    "1": [  // Infantry группа
      {
        "needScore": 0,
        "iconUrl": "https://example.com/rank1.png"
      },
      {
        "needScore": 1000,
        "iconUrl": "https://example.com/rank2.png"
      },
      {
        "needScore": 5000,
        "iconUrl": "https://example.com/rank3.png"
      }
    ],
    "2": [  // Armor группа
      {
        "needScore": 0,
        "iconUrl": "https://example.com/armor1.png"
      },
      {
        "needScore": 2000,
        "iconUrl": "https://example.com/armor2.png"
      }
    ],
    "3": [  // Aviation группа
      {
        "needScore": 0,
        "iconUrl": "https://example.com/avia1.png"
      },
      {
        "needScore": 1500,
        "iconUrl": "https://example.com/avia2.png"
      }
    ]
  }
}
```

---

## ЧАСТЬ 3: Адаптация данных из MongoDB для фронтенда

### Что читаем из MongoDB:

**1. Основная статистика**:
- `kills` → фронтенд показывает как есть
- `death` → фронтенд показывает как "deaths"
- `kd` → K/D ratio
- `revives` → количество оживлений
- `teamkills` → тимкиллы (TK)

**2. Матчи**:
- `matches.matches` → всего матчей
- `matches.won` → побед
- `matches.winrate` → винрейт (%)

**3. Время игры**:
- `squad.timeplayed` (минуты) → конвертируем в "Xд Yч" формат
  ```javascript
  // Пример: 20520 минут = 342 часа = 14 дней 6 часов
  const totalMinutes = 20520;
  const days = Math.floor(totalMinutes / 1440);  // 14
  const hours = Math.floor((totalMinutes % 1440) / 60);  // 6
  // Результат: "14д 6ч"
  ```
- `squad.leader` (минуты) → время Squad Leader
- `squad.cmd` (минуты) → время Commander

**4. Топ оружие** (расчет на бэкенде):
```javascript
// Берем все weapons, сортируем по убийствам, берем топ-1
const topWeapon = Object.entries(weapons)
  .sort((a, b) => b[1] - a[1])[0];

// "US_Weapons_M4A1" → "M4A1" (убираем префиксы)
const weaponName = topWeapon[0].split('_').pop();

// Результат:
{
  name: "M4A1",
  kills: 245
}
```

**5. Топ роль** (расчет на бэкенде):
```javascript
// Берем все roles, сортируем по времени, берем топ-1
const topRole = Object.entries(roles)
  .sort((a, b) => b[1] - a[1])[0];

// "US_Army_Rifleman" → "Rifleman" (убираем префиксы)
const roleName = topRole[0].split('_').pop();

// Конвертируем минуты в часы
const hours = Math.floor(topRole[1] / 60);

// Результат:
{
  name: "Rifleman",
  time: "90ч"
}
```

**6. Время на технике** (используем calcVehicleTime из statsCalculations.js):
```javascript
import { calcVehicleTime } from '@/lib/statsCalculations';

// possess содержит время в СЕКУНДАХ
const [heavyTime, heliTime] = calcVehicleTime(possess);

// Конвертируем секунды в часы
const heavyHours = Math.floor(heavyTime / 3600);  // "2ч"
const heliHours = Math.floor(heliTime / 3600);    // "1ч"
```

**7. Убийства на технике** (используем calcVehicleKills):
```javascript
import { calcVehicleKills } from '@/lib/statsCalculations';

const vehicleKills = calcVehicleKills(weapons);  // 9
```

**8. Убийства ножом** (используем calcKnifeKills):
```javascript
import { calcKnifeKills } from '@/lib/statsCalculations';

const knifeKills = calcKnifeKills(weapons);  // 3
```

**9. Ранг игрока** (расчет на бэкенде):
```javascript
// Берем Infantry score (группа "1")
const infantryScore = scoreGroups["1"];  // 15420

// Загружаем конфигурацию рангов из configs collection
const ranksConfig = await db.collection('configs').findOne({ type: 'score' });

// Находим текущий ранг и следующий
const infantryRanks = ranksConfig.icons["1"];
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

// Рассчитываем прогресс до следующего ранга
let progress = 0;
if (nextRank) {
  const currentNeed = currentRank.needScore;
  const nextNeed = nextRank.needScore;
  const playerScore = infantryScore;
  progress = ((playerScore - currentNeed) / (nextNeed - currentNeed)) * 100;
}

// Результат:
{
  current: {
    iconUrl: "https://example.com/rank3.png",
    needScore: 10000
  },
  next: {
    iconUrl: "https://example.com/rank4.png",
    needScore: 20000
  },
  progress: 54.2  // %
}
```

---

## ЧАСТЬ 4: API Response Format (что получает фронтенд)

### GET /api/stats/:steamId

**Входные данные**: Steam ID игрока

**Что делает бэкенд**:
1. Читает документ из MongoDB collection `mainstats` по `_id = steamId`
2. Читает конфигурацию рангов из collection `configs`
3. Применяет все расчеты из `statsCalculations.js`
4. Форматирует данные для фронтенда

**Выходные данные** (JSON):
```json
{
  "steamId": "STEAM_0:1:12345678",
  "name": "TacticalViper",
  
  "kills": 1245,
  "deaths": 892,
  "kd": 1.4,
  "revives": 156,
  "teamkills": 12,
  
  "matches": {
    "matches": 178,
    "won": 88,
    "winrate": 49.44
  },
  
  "playtime": "14д 6ч",
  "squadLeaderTime": "4д 7ч",
  "commanderTime": "21ч",
  
  "rank": {
    "current": {
      "iconUrl": "https://api.dicebear.com/7.x/shapes/svg?seed=rank3+",
      "needScore": 10000
    },
    "next": {
      "iconUrl": "https://api.dicebear.com/7.x/shapes/svg?seed=rank4+",
      "needScore": 20000
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
  },
  
  "vehicleTime": {
    "heavy": "2ч",
    "heli": "1ч"
  },
  
  "vehicleKills": 9,
  "knifeKills": 3
}
```

---

## ЧАСТЬ 5: Связь между PostgreSQL и MongoDB

### Scenario 1: Гость просматривает профиль игрока

```
1. GET /api/stats/STEAM_0:1:12345678
   ↓
2. MongoDB: SELECT * FROM mainstats WHERE _id = 'STEAM_0:1:12345678'
   ↓
3. Расчеты (topWeapon, topRole, rank, etc.)
   ↓
4. Return JSON с форматированными данными
```

### Scenario 2: Гость подает заявку в клан

```
1. Фронтенд: GET /api/stats/:steamId → получает статистику
   ↓
2. Фронтенд: POST /api/clans/:id/applications
   Body: {
     playerSteamId: "...",
     playerName: "...",
     message: "...",
     statsSnapshot: { /* статистика из шага 1 */ }
   }
   ↓
3. PostgreSQL: INSERT INTO clan_applications (...)
```

### Scenario 3: Owner одобряет заявку

```
1. POST /api/clans/:id/applications/:appId/approve
   ↓
2. PostgreSQL Transaction:
   - SELECT application WHERE id = appId
   - INSERT INTO players (steamId, username) ON CONFLICT DO NOTHING
   - INSERT INTO clan_members (clanId, playerId, role, statsSnapshot)
   - UPDATE applications SET status = 'accepted'
   - UPDATE players SET currentClanId = ...
   ↓
3. Return { application, member }
```

---

## ЧАСТЬ 6: Environment Variables

```env
# PostgreSQL (Application Data)
DATABASE_URL=postgresql://user:password@host:5432/zaruba

# MongoDB (Squad Stats - Read Only)
MONGO_URI=mongodb://user:password@host:27017/squadjs
MONGO_DB=squadjs
MONGO_COLLECTION_STATS=mainstats
MONGO_COLLECTION_CONFIG=configs
```

---

## Итого: Что хранится где

| Данные | PostgreSQL | MongoDB |
|--------|-----------|---------|
| Профиль игрока (steamId, username, discordId) | ✅ players | - |
| Клан (название, тег, требования, тема) | ✅ clans | - |
| Членство в клане | ✅ clan_members | - |
| Заявки на вступление | ✅ clan_applications | - |
| Игровая статистика (kills, deaths, playtime) | - | ✅ mainstats |
| Роли игрока (время в каждой роли) | - | ✅ mainstats |
| Оружие игрока (убийства каждым оружием) | - | ✅ mainstats |
| Техника (время владения) | - | ✅ mainstats |
| Система рангов (иконки, пороги) | - | ✅ configs |

**Принцип разделения**:
- PostgreSQL = данные приложения (создаются и изменяются пользователями)
- MongoDB = игровые данные (создаются SquadJS автоматически, только чтение)
