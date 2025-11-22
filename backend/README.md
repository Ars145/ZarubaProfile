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
- ✅ PostgreSQL модели (SQLAlchemy)
- ✅ CRUD эндпоинты для кланов
- ✅ CORS конфигурация
- ✅ Базовая структура проекта

**В разработке:**
- 🚧 Аутентификация
- 🚧 Загрузка файлов
- 🚧 Интеграция MongoDB статистики
- 🚧 Эндпоинты для заявок
