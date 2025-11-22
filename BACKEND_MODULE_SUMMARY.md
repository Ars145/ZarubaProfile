# ZARUBA Backend Module - Краткая Сводка

## 📦 Что Подготовлено

Бэкенд-модуль готов как **автономный пакет** для интеграции в любой проект.

### Расположение Модуля

```
/tmp/cc-agent/60555384/project/zaruba-backend-module/
```

### Также доступен архив

```
/tmp/cc-agent/60555384/project/zaruba-backend-module.tar.gz
```

---

## 📂 Структура Модуля

```
zaruba-backend-module/
├── package.json                     # NPM пакет конфигурация
├── BACKEND_MODULE_README.md         # Полная документация (16KB)
├── QUICK_INTEGRATION_GUIDE.md       # Быстрая интеграция (5 мин)
├── server/
│   ├── routes.js                    # REST API endpoints
│   ├── storage.js                   # PostgreSQL + In-Memory storage
│   └── services/
│       └── squadStats.js            # MongoDB интеграция (опционально)
└── shared/
    └── schema.js                    # Drizzle ORM схемы + Zod валидация
```

---

## 🎯 Ключевые Особенности

### ✅ Полностью Автономный
- Нет зависимостей от остального кода проекта
- Можно копировать в любой Express.js проект
- Работает "из коробки"

### ✅ Гибкий Storage
- **PostgreSQL** - для production (автоматически если `DATABASE_URL` установлен)
- **In-Memory** - для разработки (автоматически если нет `DATABASE_URL`)
- Переключение без изменения кода

### ✅ Валидация Данных
- Zod схемы для всех endpoints
- Автоматическая проверка типов
- Защита от некорректных данных

### ✅ MongoDB Интеграция
- Опциональное подключение к SquadJS статистике
- Автоматическое обогащение заявок статистикой
- Fallback на mock данные если MongoDB недоступна

---

## 🚀 Интеграция (3 способа)

### 1️⃣ Быстрая (5 минут)

```bash
# Распаковать модуль
tar -xzf zaruba-backend-module.tar.gz -C your-project/backend

# Установить зависимости
npm install drizzle-orm pg zod

# Интегрировать
import { registerRoutes } from './backend/zaruba-backend-module/server/routes.js';
await registerRoutes(app);
```

**См. QUICK_INTEGRATION_GUIDE.md**

### 2️⃣ Как NPM пакет

```bash
# Опубликовать в NPM (если нужно)
cd zaruba-backend-module
npm publish

# Установить в проект
npm install @zaruba/backend-module
```

### 3️⃣ Локальный пакет

```bash
# В вашем проекте
npm install ../path/to/zaruba-backend-module
```

---

## 📡 API Endpoints

### Созданные Endpoints

| Метод | Path | Описание |
|-------|------|----------|
| `GET` | `/api/clans` | Список всех кланов |
| `GET` | `/api/clans/:id` | Детали клана |
| `POST` | `/api/clans` | Создать клан |
| `PATCH` | `/api/clans/:id` | Обновить настройки |
| `DELETE` | `/api/clans/:id` | Удалить клан |
| `GET` | `/api/clans/:id/members` | Список членов |
| `POST` | `/api/clans/:id/members` | Добавить члена |
| `DELETE` | `/api/clans/:cid/members/:mid` | Удалить члена |
| `GET` | `/api/clans/:id/applications` | Список заявок |
| `POST` | `/api/clans/:id/applications` | Подать заявку |
| `POST` | `/api/applications/:id/approve` | Одобрить |
| `POST` | `/api/applications/:id/reject` | Отклонить |
| `GET` | `/api/stats/:steamId` | Статистика игрока |
| `POST` | `/api/players` | Создать/обновить игрока |
| `GET` | `/api/players/:steamId` | Получить игрока |

---

## 🗄️ База Данных

### Таблицы (автоматически создаются)

1. **players** - Игроки
   - Связь Steam ID ↔ Discord ID
   - Текущий клан игрока

2. **clans** - Кланы
   - Название, тег, описание
   - Тема, баннер, логотип
   - Требования к вступлению

3. **clan_members** - Члены кланов
   - Роли: owner / member
   - Снимок статистики при вступлении
   - Дата вступления

4. **clan_applications** - Заявки
   - Статус: pending / accepted / rejected
   - Полная статистика кандидата
   - Сопроводительное письмо

### Миграции

```bash
# Применить автоматически
npx drizzle-kit push:pg --schema=./backend/shared/schema.js
```

---

## 🔧 Конфигурация

### Минимальная (только in-memory)

Ничего не требуется! Модуль работает сразу.

### Production (с PostgreSQL)

```env
# .env
DATABASE_URL=postgresql://user:password@host:5432/database
```

### С MongoDB (опционально)

```env
# .env
DATABASE_URL=postgresql://user:password@host:5432/database

# MongoDB для статистики Squad
MONGO_URI=mongodb://host:27017/
MONGO_DB=squadjs
MONGO_COLLECTION=mainstats
```

---

## 💡 Примеры Использования

### Базовая Интеграция

```javascript
// server/index.js
import express from 'express';
import { registerRoutes } from './backend/server/routes.js';

const app = express();
app.use(express.json());

// Всё что нужно!
await registerRoutes(app);

app.listen(5000);
```

### С Аутентификацией

```javascript
import { registerRoutes } from './backend/server/routes.js';

// Middleware для защиты endpoints
app.use('/api/clans', requireAuth);
app.use('/api/applications', requireAuth);

await registerRoutes(app);
```

### Frontend Интеграция

```javascript
// React + TanStack Query
import { useQuery } from '@tanstack/react-query';

function ClansList() {
  const { data: clans } = useQuery({
    queryKey: ['clans'],
    queryFn: async () => {
      const res = await fetch('/api/clans');
      return res.json();
    }
  });

  return (
    <div>
      {clans?.map(clan => (
        <div key={clan.id}>{clan.name}</div>
      ))}
    </div>
  );
}
```

---

## 📚 Документация

### Файлы Документации

1. **BACKEND_MODULE_README.md** (16KB)
   - Полная документация модуля
   - Все endpoints с примерами
   - Схема базы данных
   - Troubleshooting
   - Best practices

2. **QUICK_INTEGRATION_GUIDE.md** (6KB)
   - Интеграция за 5 минут
   - Пошаговые инструкции
   - Примеры кода
   - Troubleshooting

3. **BACKEND_PLAN.md** (в основном проекте)
   - Архитектура системы
   - Детальный план реализации
   - Storage интерфейс

4. **DATABASE_DETAILED_SPEC.md** (в основном проекте)
   - Полная спецификация базы данных
   - Структура таблиц
   - Индексы и ограничения
   - Примеры данных

5. **MONGODB_STATS_PLAN.md** (в основном проекте)
   - Интеграция с MongoDB
   - Структура данных SquadJS
   - Расчет статистики

---

## 🎯 Использование в Другом Проекте

### Вариант 1: Скопировать модуль

```bash
# В новом проекте
mkdir backend
cd backend

# Скопировать модуль (выберите один способ):
# a) Распаковать архив
tar -xzf /path/to/zaruba-backend-module.tar.gz

# b) Скопировать папку
cp -r /path/to/zaruba-backend-module ./
```

### Вариант 2: Git submodule

```bash
# Если модуль в git репозитории
git submodule add https://github.com/your-org/zaruba-backend backend/zaruba
```

### Вариант 3: NPM пакет

```bash
# Опубликовать в приватный NPM registry
npm publish --registry=https://your-registry.com

# Установить в проект
npm install @zaruba/backend-module --registry=https://your-registry.com
```

---

## 🔒 Безопасность

### Встроенная Защита

✅ Zod валидация - проверка всех входных данных
✅ Drizzle ORM - защита от SQL injection
✅ Транзакции - атомарные операции
✅ Уникальные ограничения - предотвращение дубликатов

### Рекомендуется Добавить

- ❗ JWT аутентификация
- ❗ Rate limiting
- ❗ CORS настройки
- ❗ HTTPS в production

---

## 📊 Производительность

- ✅ Connection pooling (max 10 connections)
- ✅ Индексы на всех FK и уникальных полях
- ✅ In-memory storage для быстрой разработки
- ✅ Легковесные queries без лишних JOIN

---

## 🧪 Тестирование

### Unit Tests

```javascript
import { storage } from './backend/server/storage.js';

// In-memory storage идеален для тестов
test('create clan', async () => {
  const player = await storage.upsertPlayer({
    steamId: 'TEST_123',
    username: 'TestPlayer'
  });

  const clan = await storage.createClan({
    name: 'Test Clan',
    tag: 'TEST',
    description: 'Test',
    theme: 'orange',
    requirements: {}
  }, player.id);

  expect(clan.tag).toBe('TEST');
});
```

### Integration Tests

```javascript
import request from 'supertest';
import express from 'express';
import { registerRoutes } from './backend/server/routes.js';

const app = express();
app.use(express.json());
await registerRoutes(app);

test('GET /api/clans', async () => {
  const res = await request(app).get('/api/clans');
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
});
```

---

## 🐛 Troubleshooting

### "Cannot find module"
➡️ Проверьте путь к модулю в import

### "DATABASE_URL not set"
➡️ Это warning - используется in-memory storage

### "Clan with this tag already exists"
➡️ Теги должны быть уникальными

**Полный список:** см. BACKEND_MODULE_README.md

---

## 📦 Что Включено

✅ REST API (15 endpoints)
✅ PostgreSQL + In-Memory storage
✅ MongoDB интеграция (опционально)
✅ Zod валидация
✅ Drizzle ORM схемы
✅ Документация (22KB)
✅ Примеры кода
✅ package.json для NPM

---

## 🎉 Готово к Использованию!

Модуль полностью готов к интеграции в любой Express.js проект.

**Время интеграции:** 5 минут
**Зависимости:** 4 пакета (drizzle-orm, pg, zod, drizzle-zod)
**Размер:** 16KB (архив)
**Совместимость:** Express 4.x, 5.x

---

## 📞 Следующие Шаги

1. Прочитайте **QUICK_INTEGRATION_GUIDE.md** (5 мин)
2. Интегрируйте модуль в проект
3. Настройте `.env` файл
4. Примените миграции
5. Тестируйте endpoints

**Удачной интеграции!** 🚀
