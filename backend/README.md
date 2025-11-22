# ZARUBA Backend (Flask API)

Flask REST API для ZARUBA Gaming Community Platform.

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
cd backend
pip install -r requirements.txt
```

### 2. Настройка окружения

Создайте файл `.env` в корне проекта (не в папке backend):

```env
# Flask
FLASK_ENV=development
SECRET_KEY=your-secret-key-here

# PostgreSQL (получите через Replit Database)
DATABASE_URL=postgresql://user:password@host:port/database

# MongoDB (SquadJS статистика - опционально)
MONGO_URI=mongodb://user:password@host:port/
MONGO_DB_NAME=SquadJS
```

**Важно:** DATABASE_URL можно получить создав PostgreSQL базу данных в Replit:
- Откройте вкладку "Tools" → "Database"
- Создайте PostgreSQL базу
- Скопируйте DATABASE_URL

### 3. Запуск сервера

```bash
cd backend
python app.py
```

Сервер запустится на `http://localhost:8000`

## 📊 Схема базы данных

### Таблица: players
| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | Primary Key |
| steam_id | TEXT | Steam ID (уникальный) |
| username | TEXT | Игровое имя |
| discord_id | TEXT | Discord ID (nullable) |
| current_clan_id | UUID | FK → clans.id |

### Таблица: clans
| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | Primary Key |
| name | TEXT | Название клана |
| tag | TEXT | Тег (уникальный) |
| description | TEXT | Описание |
| theme | TEXT | orange\|blue\|yellow |
| banner_url | TEXT | URL баннера |
| logo_url | TEXT | URL логотипа |
| requirements | JSONB | Требования |
| created_at | TIMESTAMP | Дата создания |

### Таблица: clan_members
| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | Primary Key |
| clan_id | UUID | FK → clans.id (CASCADE) |
| player_id | UUID | FK → players.id (CASCADE) |
| role | TEXT | owner\|member |
| stats_snapshot | JSONB | Статистика |
| joined_at | TIMESTAMP | Дата вступления |

**Constraint:** UNIQUE(clan_id, player_id)

### Таблица: clan_applications
| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | Primary Key |
| clan_id | UUID | FK → clans.id (CASCADE) |
| player_name | TEXT | Имя игрока |
| player_steam_id | TEXT | Steam ID |
| message | TEXT | Сообщение |
| status | TEXT | pending\|accepted\|rejected |
| stats_snapshot | JSONB | Статистика |
| created_at | TIMESTAMP | Дата подачи |

## 🔌 API Endpoints

### Кланы

**Получить все кланы:**
```http
GET /api/clans
```

**Получить клан по ID:**
```http
GET /api/clans/:id
```

**Создать клан:**
```http
POST /api/clans
Content-Type: application/json

{
  "name": "Название клана",
  "tag": "TAG",
  "description": "Описание",
  "theme": "orange",
  "requirements": {
    "minKD": 1.5,
    "minHours": 100
  }
}
```

**Обновить клан:**
```http
PUT /api/clans/:id
Content-Type: application/json

{
  "name": "Новое название",
  "description": "Новое описание"
}
```

**Удалить клан:**
```http
DELETE /api/clans/:id
```

**Получить участников клана:**
```http
GET /api/clans/:id/members
```

## 📁 Структура проекта

```
backend/
├── app.py                 # Точка входа Flask
├── config.py              # Конфигурация
├── requirements.txt       # Зависимости
├── .env.example          # Пример .env файла
│
├── models/                # SQLAlchemy модели
│   ├── __init__.py
│   ├── player.py
│   ├── clan.py
│   ├── clan_member.py
│   └── clan_application.py
│
├── routes/                # API маршруты
│   ├── __init__.py
│   └── clans.py
│
├── services/              # Бизнес-логика (будет добавлено)
├── utils/                 # Утилиты (будет добавлено)
└── data/                  # Не используется (PostgreSQL)
```

## 🛠 Разработка

### Создание миграций

При изменении моделей таблицы создаются автоматически при запуске через `db.create_all()`.

Для production рекомендуется использовать Alembic для миграций.

### CORS

CORS настроен для всех origins на `/api/*` маршрутах для упрощения разработки.
В production следует ограничить список разрешенных origins.

## 🔒 Безопасность

- ⚠️ Измените `SECRET_KEY` в production
- ⚠️ Настройте CORS для конкретных доменов в production
- ⚠️ Используйте переменные окружения для всех секретов

## 🚀 Production

Для production используйте Gunicorn:

```bash
gunicorn -w 4 -b 0.0.0.0:8000 app:app
```

## ✅ Статус

**Реализовано:**
- ✅ PostgreSQL модели (SQLAlchemy) - кланы, игроки, участники, заявки
- ✅ CRUD эндпоинты для кланов
- ✅ MongoDB интеграция для статистики Squad (SquadJS)
- ✅ API endpoints для статистики игроков
- ✅ Портированные расчёты из Discord бота (техника, оружие, ранги)
- ✅ CORS конфигурация
- ✅ Graceful degradation (работает без MongoDB)

**В разработке:**
- 🚧 Аутентификация (Steam/Discord OAuth)
- 🚧 Загрузка файлов (аватары, логотипы кланов)
- 🚧 Эндпоинты для заявок в кланы
- 🚧 Эндпоинты для игроков (регистрация, обновление)

### Статистика игроков

**Получить статистику по Steam ID:**
```http
GET /api/stats/:steamId
```

Ответ:
```json
{
  "success": true,
  "stats": {
    "steamId": "76561198000000000",
    "playerName": "Player",
    "kills": 1500,
    "deaths": 800,
    "kd": 1.88,
    "matches": 250,
    "wins": 120,
    "winRate": 48.0,
    "playtime": "150ч",
    "heavyVehicleTime": "45ч",
    "heliTime": "12ч",
    "vehicleKills": 320,
    "topWeapons": [
      {"name": "M4A1", "kills": 450},
      {"name": "M240", "kills": 200}
    ],
    "topRoles": [
      {"name": "Rifleman", "time": "80ч", "minutes": 4800}
    ],
    "rank": {
      "groupId": "2",
      "score": 15000
    }
  }
}
```

**Поиск игрока по имени:**
```http
GET /api/stats/search/:playerName
```

**Таблица лидеров:**
```http
GET /api/stats/leaderboard?sortBy=kills&limit=10
```

Параметры:
- `sortBy`: kills (default), kd, matches, wins
- `limit`: количество игроков (max 50, default 10)

**Конфигурация рангов:**
```http
GET /api/stats/ranks
```

## 🔌 MongoDB Структура

### База данных: SquadJS

**Коллекция: mainstats**
Статистика игроков Squad:
- `_id`: Steam ID игрока
- `playerName`: Имя игрока
- `kills`, `deaths`: Убийства/смерти
- `matches`, `wins`: Матчи/победы
- `time`: Время игры (минуты)
- `commanderTime`, `squadLeadTime`: Время в роли
- `possess`: Время владения техникой (мс)
- `weapons`: Убийства по оружию
- `roles`: Время в ролях (минуты)
- `scoreGroups`: Очки по группам для ранговой системы

**Коллекция: configs**
Конфигурация системы рангов:
- `type`: "score"
- `icons`: Группы рангов с требованиями

## 📚 Портированная логика

Из Discord бота (JavaScript → Python):

✅ **Расчёты времени:**
- Тяжёлая техника (танки, БМП, БТР)
- Вертолёты
- Форматирование времени (дни, часы, минуты)

✅ **Расчёты убийств:**
- Убийства из техники (по оружию)
- Категоризация оружия (артиллерия, ножи)

✅ **Ранговая система:**
- Получение высшего ранга игрока
- Прогресс до следующего ранга

## 📝 Примечания

- **MongoDB опционален**: API работает без MongoDB, возвращая 503 для stats endpoints
- **Graceful degradation**: PostgreSQL endpoints работают независимо от MongoDB
- **Production**: Для production используйте Gunicorn вместо Flask dev server
- **Безопасность**: MONGO_URI должен быть в environment variables, не в коде

## 🔐 Аутентификация (Auth)

### Steam OpenID Authentication

**Начать авторизацию через Steam:**
```http
GET /api/auth/steam/login?return_url=http://yoursite.com
```

**Ответ:**
```json
{
  "success": true,
  "authUrl": "https://steamcommunity.com/openid/login?..."
}
```

Пользователь перенаправляется на Steam. После успешной авторизации Steam вернет пользователя на `/api/auth/steam/callback` с токенами.

**Callback обрабатывается автоматически:**
```http
GET /api/auth/steam/callback
```

Возвращает redirect: `{return_url}?access_token=...&refresh_token=...`

**Требует (опционально):**
- `STEAM_API_KEY` - для получения имени и аватара из Steam API

**Процесс:**
1. User нажимает "Войти через Steam"
2. Frontend вызывает `/api/auth/steam/login`
3. Redirect на Steam OpenID
4. Steam возвращает на callback
5. Backend создает/обновляет Player в БД
6. Создается Session с refresh_token
7. Генерируются access_token и refresh_token
8. Redirect обратно с токенами

### Discord OAuth2 Linking

**Привязать Discord аккаунт (требует авторизации):**
```http
GET /api/auth/discord/link?return_url=http://yoursite.com
Authorization: Bearer {access_token}
```

**Ответ:**
```json
{
  "success": true,
  "authUrl": "https://discord.com/api/oauth2/authorize?..."
}
```

**Требует:**
- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`

**Процесс:**
1. User нажимает "Привязать Discord"
2. Frontend вызывает `/api/auth/discord/link` с access_token
3. Redirect на Discord OAuth
4. Discord возвращает на callback
5. Backend обновляет Player.discord_id
6. Redirect обратно

### JWT Token Management

**Получить текущего пользователя:**
```http
GET /api/auth/me
Authorization: Bearer {access_token}
```

**Ответ:**
```json
{
  "success": true,
  "player": {
    "id": "uuid",
    "steamId": "76561198...",
    "username": "PlayerName",
    "discordId": "123456789",
    "avatarUrl": "/static/uploads/avatars/...",
    "currentClanId": "uuid",
    "lastLogin": "2025-11-22T17:58:00Z"
  }
}
```

**Обновить access токен:**
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "..."
}
```

**Ответ:**
```json
{
  "success": true,
  "accessToken": "new_jwt_token",
  "refreshToken": "same_refresh_token"
}
```

**Выход (logout):**
```http
POST /api/auth/logout
Content-Type: application/json

{
  "refreshToken": "..."
}
```

**Ответ:**
```json
{
  "success": true
}
```

### Защищенные Endpoints

Endpoints с `@require_auth` требуют:
```http
Authorization: Bearer {access_token}
```

Текущий user доступен через `request.current_player`.

## 📁 Загрузка файлов (File Uploads)

Все upload endpoints требуют авторизации.

### Загрузить аватар игрока

```http
POST /api/uploads/avatar
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

file: <image_file>
```

**Ответ:**
```json
{
  "success": true,
  "avatarUrl": "/static/uploads/avatars/uuid.jpg"
}
```

**Ограничения:**
- Форматы: PNG, JPG, JPEG, GIF, WEBP
- Максимальный размер: 5MB
- Автоматический resize: до 256x256px
- Качество JPEG: 85%

### Загрузить логотип клана

```http
POST /api/uploads/clan-logo
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

file: <image_file>
clanId: <uuid>
```

**Требует:** User должен быть owner клана.

**Ответ:**
```json
{
  "success": true,
  "logoUrl": "/static/uploads/clan-logos/uuid.jpg"
}
```

**Ограничения:**
- Форматы: PNG, JPG, JPEG, GIF, WEBP
- Максимальный размер: 5MB
- Автоматический resize: до 512x512px
- Качество JPEG: 90%

### Загрузить баннер клана

```http
POST /api/uploads/clan-banner
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

file: <image_file>
clanId: <uuid>
```

**Требует:** User должен быть owner клана.

**Ответ:**
```json
{
  "success": true,
  "bannerUrl": "/static/uploads/clan-banners/uuid.jpg"
}
```

**Ограничения:**
- Форматы: PNG, JPG, JPEG, GIF, WEBP
- Максимальный размер: 5MB
- Автоматический resize: до 1920x400px
- Качество JPEG: 90%

### Обработка изображений

FileService автоматически:
- Проверяет формат и размер
- Конвертирует в RGB (из RGBA/LA/P)
- Ресайзит с сохранением пропорций (thumbnail)
- Оптимизирует и сжимает
- Удаляет старые файлы при замене
- Генерирует уникальные имена (UUID)

### Коды ошибок

**400 Bad Request:**
- Файл не предоставлен
- Недопустимый формат
- Файл слишком большой
- Неверный формат изображения

**403 Forbidden:**
- Только владелец может загружать логотип/баннер

**404 Not Found:**
- Клан не найден

## 🗂️ Структура файлов

```
static/
└── uploads/
    ├── avatars/         # 256x256px
    ├── clan-logos/      # 512x512px
    └── clan-banners/    # 1920x400px
```

Все загруженные файлы доступны по URL: `/static/uploads/{path}/{filename}.jpg`


## 🔒 Безопасность

### Реализованные меры защиты

**Аутентификация:**
- JWT с автоматическим expiry (access: 1 час)
- Refresh token rotation при каждом обновлении
- Session tracking с user-agent и IP
- Автоматическое удаление истекших сессий
- CASCADE deletes для sessions при удалении игрока

**OAuth защита:**
- CSRF protection через временные state tokens (10 минут)
- State валидация для Discord OAuth
- Автоматическая очистка истекших OAuth states
- Обязательная авторизация для Discord linking

**Open Redirect защита:**
- Валидация return_url через `is_safe_url()`
- Только same-origin redirects разрешены
- Белый список доменов

**File Upload защита:**
- Форматы: только PNG, JPG, JPEG, GIF, WEBP
- Размер: максимум 5MB
- Pillow validation - проверка формата
- Автоматическая конвертация в RGB
- Resize с сохранением пропорций
- Уникальные UUID имена файлов
- Удаление старых файлов при замене

**API защита:**
- CORS настроен на /api/* endpoints
- Authorization required для protected endpoints
- @require_auth decorator валидирует токены
- Graceful degradation (MongoDB optional)

### Production рекомендации

**Обязательно:**
1. Установить `SECRET_KEY` (сгенерировать криптографически безопасный)
2. Использовать HTTPS (для production)
3. Настроить CORS whitelist (убрать "*")
4. Использовать Gunicorn (не Flask dev server)
5. Настроить rate limiting
6. Установить `STEAM_API_KEY` для получения аватаров

**Опционально:**
- `DISCORD_CLIENT_ID` + `DISCORD_CLIENT_SECRET` для Discord linking
- `MONGO_URI` для статистики SquadJS

**Генерация SECRET_KEY:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(64))"
```

**Запуск production:**
```bash
gunicorn --bind 0.0.0.0:8000 --workers 4 --reuse-port app:app
```

