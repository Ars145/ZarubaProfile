# Настройка PostgreSQL для ZARUBA

## Вариант 1: Встроенная Replit PostgreSQL (Рекомендуется)
✅ Уже настроена и работает!
- Переменные окружения: DATABASE_URL, PGHOST, PGPORT и т.д.
- Откройте панель "Database" в Replit для управления

## Вариант 2: Своя PostgreSQL база

### 1. Создайте базу данных
```sql
CREATE DATABASE zaruba_db;
CREATE USER zaruba_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE zaruba_db TO zaruba_user;
```

### 2. Измените DATABASE_URL в Replit Secrets
Формат: `postgresql://username:password@hostname:5432/database_name`

Примеры:
- Локально через ngrok: `postgresql://user:pass@abc.ngrok.io:5432/zaruba_db`
- VPS: `postgresql://user:pass@192.168.1.100:5432/zaruba_db`
- AWS RDS: `postgresql://admin:pass@mydb.region.rds.amazonaws.com:5432/zaruba`

### 3. Таблицы создадутся автоматически!
Flask + SQLAlchemy автоматически создаст все таблицы при первом запуске.

### 4. Примените миграцию для удаления max_members
```sql
-- Если база данных новая, эта миграция не нужна
-- Если вы мигрируете с существующей базы:
ALTER TABLE clans DROP COLUMN IF EXISTS max_members;
```

## Структура таблиц

```sql
-- players
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    steam_id TEXT UNIQUE,
    discord_id TEXT UNIQUE,
    username TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP
);

-- clans
CREATE TABLE clans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    tag TEXT UNIQUE NOT NULL,
    description TEXT,
    theme TEXT DEFAULT 'orange',
    banner_url TEXT,
    logo_url TEXT,
    requirements JSONB,
    level INTEGER DEFAULT 1,
    winrate FLOAT DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- clan_members
CREATE TABLE clan_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clan_id UUID REFERENCES clans(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    joined_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(clan_id, player_id)
);

-- clan_applications
CREATE TABLE clan_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clan_id UUID REFERENCES clans(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    message TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(clan_id, player_id)
);

-- clan_invitations
CREATE TABLE clan_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clan_id UUID REFERENCES clans(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    inviter_id UUID REFERENCES players(id) ON DELETE CASCADE,
    message TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
);

-- sessions
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    refresh_token TEXT NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL
);

-- oauth_states
CREATE TABLE oauth_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state TEXT UNIQUE NOT NULL,
    provider TEXT NOT NULL,
    return_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL
);
```

## Проверка подключения

```python
# В Python консоли Replit:
from backend.models import db
from backend.app import app

with app.app_context():
    # Создать все таблицы
    db.create_all()
    print("Таблицы успешно созданы!")
```

## Troubleshooting

### Ошибка: "could not connect to server"
- Проверьте, что PostgreSQL запущен
- Убедитесь, что порт 5432 открыт
- Проверьте правильность hostname в DATABASE_URL

### Ошибка: "password authentication failed"
- Проверьте username и password в DATABASE_URL
- Убедитесь, что пользователь имеет права на базу данных

### Таблицы не создаются
```python
# Запустите в Python консоли:
from backend.app import app
from backend.models import db

with app.app_context():
    db.create_all()
```
