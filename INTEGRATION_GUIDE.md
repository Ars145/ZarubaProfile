# Руководство по Интеграции Бэкенда

## 🎯 Цель
Это руководство поможет интегрировать API бэкенда профиля и кланов в ваш основной проект ZARUBA.

---

## 📦 Что Вы Получаете

После реализации бэкенда у вас будет:

```
zaruba-profile-backend/
├── shared/
│   └── schema.ts          # Drizzle схемы и TypeScript типы
├── server/
│   ├── storage.ts         # Интерфейс для работы с БД
│   └── routes.ts          # API endpoints
├── drizzle/
│   └── migrations/        # SQL миграции
└── client/
    └── src/
        ├── lib/
        │   └── api.ts     # API клиент
        └── hooks/
            ├── useProfile.ts
            ├── useClans.ts
            └── ...
```

---

## 🚀 Шаги Интеграции

### Шаг 1: Подготовка Базы Данных

#### 1.1 Создать PostgreSQL базу (если еще нет)
```bash
# Через Replit Database tool или вручную
createdb zaruba_production
```

#### 1.2 Применить миграции
```bash
npm run db:migrate
```

Это создаст следующие таблицы:
- `players` - информация об игроках
- `player_stats` - статистика игроков
- `clans` - кланы
- `clan_members` - члены кланов
- `clan_applications` - заявки в кланы

#### 1.3 (Опционально) Загрузить тестовые данные
```bash
npm run db:seed
```

---

### Шаг 2: Интеграция Аутентификации

Бэкенд ожидает, что ваш основной проект предоставит middleware для аутентификации.

#### Вариант A: Если у вас уже есть аутентификация

```typescript
// server/index.ts (ваш основной проект)
import { registerRoutes } from './zaruba-profile/server/routes';

// Ваш middleware аутентификации
app.use('/api', async (req, res, next) => {
  try {
    // Получите userId из вашей системы аутентификации
    const token = req.headers.authorization?.replace('Bearer ', '');
    const userId = await yourAuthSystem.verifyToken(token);
    
    // Добавьте userId в request
    req.userId = userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

// Регистрируйте routes после middleware
await registerRoutes(app);
```

#### Вариант B: Если используете Passport.js

```typescript
import passport from 'passport';

app.use('/api', 
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    req.userId = req.user.id;
    next();
  }
);

await registerRoutes(app);
```

#### Вариант C: Для разработки (mock auth)

```typescript
// ТОЛЬКО ДЛЯ РАЗРАБОТКИ!
app.use('/api', (req, res, next) => {
  // Mock пользователь для тестирования
  req.userId = 'test-user-id';
  next();
});

await registerRoutes(app);
```

---

### Шаг 3: Синхронизация Данных

#### 3.1 Создание Профиля при Регистрации

Когда пользователь регистрируется в вашей системе, создайте соответствующий профиль игрока:

```typescript
// После успешной регистрации пользователя
import { storage } from './zaruba-profile/server/storage';

async function handleUserRegistration(userData) {
  // Создайте пользователя в вашей системе
  const user = await yourAuth.createUser(userData);
  
  // Создайте профиль игрока
  await storage.createPlayer({
    id: user.id, // используйте тот же ID
    username: userData.username,
    steamId: userData.steamId, // если есть
    avatarUrl: userData.avatarUrl || generateDefaultAvatar(),
  });
  
  // Создайте статистику с нулевыми значениями
  await storage.createPlayerStats({
    playerId: user.id,
  });
  
  return user;
}
```

#### 3.2 Синхронизация Steam Данных (опционально)

Если вы интегрируете Steam API:

```typescript
import { storage } from './zaruba-profile/server/storage';

async function syncSteamStats(userId: string, steamId: string) {
  // Получите данные из Steam API
  const steamData = await steamAPI.getPlayerStats(steamId);
  
  // Обновите статистику в БД
  await storage.updatePlayerStats(userId, {
    kills: steamData.kills,
    deaths: steamData.deaths,
    playtimeMinutes: steamData.playtime,
    // ... остальные поля
  });
}

// Запускайте синхронизацию периодически или по запросу
setInterval(() => syncAllActivePlayers(), 5 * 60 * 1000); // каждые 5 минут
```

#### 3.3 Синхронизация Discord (опционально)

```typescript
// Discord OAuth callback
app.get('/auth/discord/callback', async (req, res) => {
  const discordCode = req.query.code;
  const discordUser = await getDiscordUser(discordCode);
  
  await storage.updatePlayer(req.userId, {
    discordId: `${discordUser.username}#${discordUser.discriminator}`
  });
  
  res.redirect('/profile');
});
```

---

### Шаг 4: Настройка Frontend

#### 4.1 Установить зависимости (если еще нет)

```bash
npm install @tanstack/react-query
```

#### 4.2 Настроить Query Client

```tsx
// client/src/main.jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 минута
      cacheTime: 5 * 60 * 1000, // 5 минут
      refetchOnWindowFocus: false,
    },
  },
});

root.render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
```

#### 4.3 Обновить ProfilePage

```tsx
// client/src/pages/profile.jsx
import { useProfile } from '@/hooks/useProfile';
import { useClans } from '@/hooks/useClans';
import { useClanMembers } from '@/hooks/useClanMembers';

export default function ProfilePage() {
  const { profile, stats, clan, isLoading } = useProfile();
  const { data: clansData } = useClans();
  
  // Замените все useState с mock данными на данные из API
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  // Используйте profile, stats, clan вместо локального state
  return (
    <div>
      <h1>{profile.username}</h1>
      {/* ... */}
    </div>
  );
}
```

---

### Шаг 5: Environment Variables

Создайте `.env` файл:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/zaruba

# Server
PORT=5000
NODE_ENV=production

# Authentication (ваши ключи)
JWT_SECRET=your-super-secret-jwt-key
SESSION_SECRET=your-session-secret

# Optional - Steam API
STEAM_API_KEY=your-steam-api-key

# Optional - Discord OAuth
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret
DISCORD_REDIRECT_URI=https://yourapp.com/auth/discord/callback

# CORS (если фронтенд на другом домене)
CORS_ORIGIN=https://yourfrontend.com
```

---

### Шаг 6: CORS Configuration (если нужно)

Если ваш фронтенд на другом домене:

```typescript
// server/index.ts
import cors from 'cors';

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5000',
  credentials: true,
}));
```

---

## 🔒 Безопасность

### Checklist безопасности

- [ ] ✅ JWT токены хранятся безопасно (HttpOnly cookies или secure storage)
- [ ] ✅ Все пароли хешируются (bcrypt/argon2)
- [ ] ✅ SQL injection защита (Drizzle ORM автоматически)
- [ ] ✅ XSS защита (валидация входных данных через Zod)
- [ ] ✅ CSRF protection (если используете cookies)
- [ ] ✅ Rate limiting на API endpoints
- [ ] ✅ HTTPS в продакшене
- [ ] ✅ Environment variables не коммитятся в git
- [ ] ✅ Логирование ошибок (но не sensitive данных)

### Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // максимум 100 запросов с одного IP
  message: 'Too many requests, please try again later',
});

app.use('/api/', apiLimiter);

// Более строгий лимит для определенных endpoints
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // только 5 запросов
});

app.use('/api/clans', strictLimiter); // создание клана
app.use('/api/clans/:id/apply', strictLimiter); // подача заявки
```

---

## 📊 Мониторинг

### Логирование

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// В routes
app.post('/api/clans/:id/apply', async (req, res) => {
  try {
    logger.info('Application submitted', { 
      userId: req.userId, 
      clanId: req.params.id 
    });
    // ...
  } catch (error) {
    logger.error('Failed to submit application', { 
      error: error.message,
      userId: req.userId 
    });
  }
});
```

### Метрики (опционально)

```typescript
import prometheus from 'prom-client';

const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'status_code'],
});

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    httpRequestDuration.labels(req.method, req.route?.path, res.statusCode).observe(duration);
  });
  next();
});
```

---

## 🧪 Тестирование

### Unit Tests

```typescript
// server/__tests__/storage.test.ts
import { storage } from '../storage';

describe('Storage', () => {
  it('should create a player', async () => {
    const player = await storage.createPlayer({
      username: 'TestPlayer',
      steamId: 'STEAM_123',
    });
    
    expect(player).toBeDefined();
    expect(player.username).toBe('TestPlayer');
  });
  
  it('should get player stats', async () => {
    const stats = await storage.getPlayerStats('player-id');
    expect(stats.kills).toBeGreaterThanOrEqual(0);
  });
});
```

### Integration Tests

```typescript
// server/__tests__/api.test.ts
import request from 'supertest';
import { app } from '../index';

describe('Players API', () => {
  it('GET /api/players/me should return player profile', async () => {
    const response = await request(app)
      .get('/api/players/me')
      .set('Authorization', `Bearer ${testToken}`);
      
    expect(response.status).toBe(200);
    expect(response.body.player).toBeDefined();
  });
  
  it('PATCH /api/players/me should update profile', async () => {
    const response = await request(app)
      .patch('/api/players/me')
      .set('Authorization', `Bearer ${testToken}`)
      .send({ username: 'NewUsername' });
      
    expect(response.status).toBe(200);
    expect(response.body.player.username).toBe('NewUsername');
  });
});
```

---

## 🐛 Отладка

### Debug Mode

```typescript
// .env
DEBUG=zaruba:*

// В коде
import debug from 'debug';
const log = debug('zaruba:routes');

app.get('/api/players/me', async (req, res) => {
  log('Fetching profile for user:', req.userId);
  // ...
});
```

### Database Queries

```typescript
// Включить логирование всех SQL запросов
import { drizzle } from 'drizzle-orm/node-postgres';

const db = drizzle(pool, {
  logger: {
    logQuery: (query, params) => {
      console.log('SQL:', query);
      console.log('Params:', params);
    },
  },
});
```

---

## 📈 Оптимизация

### Database Indexes

Уже включены в миграциях:
```sql
CREATE INDEX idx_players_username ON players(username);
CREATE INDEX idx_players_steam_id ON players(steam_id);
CREATE INDEX idx_clan_members_clan_id ON clan_members(clan_id);
CREATE INDEX idx_clan_members_player_id ON clan_members(player_id);
CREATE INDEX idx_applications_clan_id ON clan_applications(clan_id);
CREATE INDEX idx_applications_status ON clan_applications(status);
```

### Connection Pooling

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // максимум 20 соединений
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### Caching

```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Cache clan list
app.get('/api/clans', async (req, res) => {
  const cacheKey = 'clans:list';
  const cached = await redis.get(cacheKey);
  
  if (cached) {
    return res.json(JSON.parse(cached));
  }
  
  const clans = await storage.getClans();
  await redis.setex(cacheKey, 300, JSON.stringify(clans)); // 5 минут
  
  res.json(clans);
});
```

---

## 🚀 Деплой в Production

### Checklist перед деплоем

- [ ] ✅ Все environment variables настроены
- [ ] ✅ Database миграции применены
- [ ] ✅ SSL сертификаты установлены (HTTPS)
- [ ] ✅ CORS настроен правильно
- [ ] ✅ Rate limiting включен
- [ ] ✅ Логирование настроено
- [ ] ✅ Error handling корректно работает
- [ ] ✅ Все тесты проходят
- [ ] ✅ Backup базы данных настроен
- [ ] ✅ Мониторинг настроен

### Build Script

```json
{
  "scripts": {
    "build": "tsc && vite build",
    "db:migrate": "drizzle-kit push:pg",
    "start": "NODE_ENV=production node dist/server/index.js"
  }
}
```

---

## 💡 Полезные Команды

```bash
# Database
npm run db:migrate         # Применить миграции
npm run db:seed           # Загрузить тестовые данные
npm run db:studio         # Открыть Drizzle Studio

# Development
npm run dev               # Запустить dev сервер
npm run build            # Собрать проект
npm start                # Запустить production

# Testing
npm test                 # Запустить тесты
npm run test:watch       # Тесты в watch mode
npm run test:coverage    # Покрытие тестами
```

---

## 🆘 Troubleshooting

### Проблема: "Cannot connect to database"
```bash
# Проверьте DATABASE_URL
echo $DATABASE_URL

# Проверьте что PostgreSQL запущен
pg_isready

# Проверьте подключение вручную
psql $DATABASE_URL
```

### Проблема: "Unauthorized" на всех запросах
```typescript
// Проверьте что middleware аутентификации настроен
// Проверьте что токен передается корректно
console.log('Headers:', req.headers.authorization);
console.log('UserId:', req.userId);
```

### Проблема: CORS errors
```typescript
// Убедитесь что CORS настроен правильно
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));
```

---

## 📞 Поддержка

Если возникли вопросы по интеграции:
1. Проверьте BACKEND_PLAN.md для деталей API
2. Посмотрите API_EXAMPLES.md для примеров использования
3. Изучите код в `server/routes.ts` и `server/storage.ts`

---

**Успешной интеграции!** 🎉
