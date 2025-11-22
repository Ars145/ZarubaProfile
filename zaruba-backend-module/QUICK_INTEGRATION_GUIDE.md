# ZARUBA Backend - Быстрая Интеграция (5 минут)

## 🚀 Самый Быстрый Способ

### Шаг 1: Скопировать файлы (1 мин)

```bash
# В вашем проекте создать папку backend
mkdir -p your-project/backend

# Скопировать модуль
cp -r zaruba-backend/server your-project/backend/
cp -r zaruba-backend/shared your-project/backend/
```

### Шаг 2: Установить зависимости (1 мин)

```bash
cd your-project
npm install drizzle-orm drizzle-zod pg zod
```

### Шаг 3: Настроить .env (30 сек)

```env
# .env
DATABASE_URL=postgresql://user:password@host:5432/database
```

### Шаг 4: Интегрировать в Express (2 мин)

```javascript
// server/index.js
import express from 'express';
import { registerRoutes } from './backend/server/routes.js';

const app = express();
app.use(express.json());

// ✅ Это всё что нужно!
await registerRoutes(app);

app.listen(5000);
```

### Шаг 5: Применить миграции (30 сек)

```bash
npx drizzle-kit push:pg --schema=./backend/shared/schema.js
```

## ✅ Готово!

Теперь доступны все endpoints:

```bash
# Список кланов
curl http://localhost:5000/api/clans

# Создать клан
curl -X POST http://localhost:5000/api/clans \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Clan",
    "tag": "TEST",
    "description": "Test clan",
    "theme": "orange",
    "requirements": {},
    "ownerId": "player-id-or-steam-id"
  }'
```

---

## 🎯 Без PostgreSQL? (Разработка)

Просто **не устанавливайте** `DATABASE_URL` - модуль автоматически использует in-memory storage:

```javascript
// Без .env файла
// Всё работает в памяти!
await registerRoutes(app);
```

**Идеально для:**
- Быстрого прототипирования
- Локальной разработки
- Unit-тестов

---

## 📡 Основные Endpoints

| Endpoint | Что делает |
|----------|-----------|
| `GET /api/clans` | Список кланов |
| `POST /api/clans` | Создать клан |
| `GET /api/clans/:id` | Детали клана |
| `GET /api/clans/:id/members` | Члены клана |
| `POST /api/clans/:id/applications` | Подать заявку |
| `POST /api/applications/:id/approve` | Одобрить заявку |

Полный список: см. **BACKEND_MODULE_README.md**

---

## 🔌 MongoDB (Опционально)

Для интеграции со статистикой Squad:

```env
MONGO_URI=mongodb://host:27017/
MONGO_DB=squadjs
MONGO_COLLECTION=mainstats
```

```bash
npm install mongodb
```

Endpoint:
```bash
GET /api/stats/:steamId
```

---

## 🛠️ Структура Файлов

```
your-project/
├── backend/
│   ├── server/
│   │   ├── routes.js      ← API endpoints
│   │   ├── storage.js     ← Database logic
│   │   └── services/
│   │       └── squadStats.js
│   └── shared/
│       └── schema.js      ← DB schema + validation
├── server/
│   └── index.js           ← Ваш главный файл
└── .env
```

---

## 💡 Примеры Кода

### Создать Клан

```javascript
const response = await fetch('/api/clans', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Отряд Альфа',
    tag: 'ALPHA',
    description: 'Элитный отряд',
    theme: 'orange',
    requirements: {
      microphone: true,
      ageRestriction: true,
      customRequirement: '100ч+'
    },
    ownerId: 'player-uuid'
  })
});

const clan = await response.json();
console.log('Клан создан:', clan.id);
```

### Подать Заявку

```javascript
const response = await fetch(`/api/clans/${clanId}/applications`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    playerSteamId: 'STEAM_0:1:12345678',
    message: 'Хочу вступить в клан!'
  })
});

const application = await response.json();
console.log('Заявка подана:', application.id);
```

### Одобрить Заявку

```javascript
const response = await fetch(`/api/applications/${appId}/approve`, {
  method: 'POST'
});

const { application, member } = await response.json();
console.log('Игрок добавлен в клан:', member.id);
```

---

## 🔒 Добавить Аутентификацию

```javascript
// Middleware
function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  // Проверка токена
  req.userId = verifyToken(token);
  next();
}

// Защитить endpoints
app.use('/api/clans', requireAuth);
await registerRoutes(app);
```

---

## 🐛 Troubleshooting

### Ошибка: "Cannot find module"
```bash
# Проверить путь к модулю
ls backend/server/routes.js

# Убедиться что путь правильный в import
import { registerRoutes } from './backend/server/routes.js';
```

### Ошибка: "DATABASE_URL not set"
```bash
# Это warning, не ошибка - используется in-memory storage
# Для production добавьте DATABASE_URL в .env
```

### Ошибка: "Cannot connect to database"
```bash
# Проверить DATABASE_URL
echo $DATABASE_URL

# Проверить PostgreSQL запущен
pg_isready

# Проверить подключение
psql $DATABASE_URL
```

---

## 📚 Больше Информации

- **BACKEND_MODULE_README.md** - полная документация
- **BACKEND_PLAN.md** - архитектура и планирование
- **DATABASE_DETAILED_SPEC.md** - детальная спецификация БД
- **INTEGRATION_GUIDE.md** - расширенное руководство

---

## ✨ Готово!

Модуль полностью интегрирован. Теперь у вас есть:

✅ REST API для управления кланами
✅ Система заявок с автоматической статистикой
✅ Управление членами кланов
✅ Валидация данных через Zod
✅ PostgreSQL или In-Memory storage
✅ Опциональная интеграция с MongoDB

**Время интеграции: 5 минут** ⏱️
