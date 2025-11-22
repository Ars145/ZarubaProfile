# ZARUBA Gaming Community Platform

## Overview

ZARUBA is a tactical gaming community platform built for Squad server players. The application provides player profiles, clan management, and detailed game statistics integration. It features a modern React frontend designed to integrate with existing Squad server infrastructure (MongoDB statistics database) and Discord bot ecosystem.

The platform enables players to view their gaming statistics, join clans, manage clan memberships, and track their progression through a ranking system based on in-game performance.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (November 22, 2025)

**Steam & Discord Authentication Integration:**
- ✅ Implemented complete Steam OpenID authentication
  - GET /api/auth/steam/login - initiates Steam login flow
  - GET /api/auth/steam/callback - validates OpenID response
  - Fetches player data (username, avatar) from Steam API on first login
  - Stores avatar_url, updates last_login on every authentication
  - JWT-based session management with access + refresh tokens
- ✅ Added Discord OAuth2 linking system
  - GET /api/auth/discord/link - initiates Discord OAuth with state token
  - GET /api/auth/discord/callback - validates state, exchanges code for user data
  - Securely stores discord_id and discord_username in player table
  - State token validation prevents CSRF attacks
- ✅ Created Profile.jsx page
  - Displays Steam profile (username, avatar, Steam ID)
  - Shows Discord connection status with link/unlink functionality
  - Toast notifications for success/error states
  - data-testid attributes for testing
- ✅ Extended Player model with authentication fields
  - avatar_url, discord_username, created_at, last_login columns
  - JWT token generation and validation in AuthService
- ✅ Fixed Vite proxy configuration
  - All /api requests proxied from frontend (port 5000) to backend (port 8000)
  - Relative API URLs for seamless development

**FloatingLines Animated Background:**
- ✅ Created FloatingLines component (Frontend/src/components/FloatingLines.jsx)
  - Three.js WebGL implementation with GLSL fragment shaders
  - Interactive wave rendering with mouse tracking
  - Gradient support with custom color stops
  - Parallax effect based on mouse movement
  - Bend effect when hovering (bendRadius: 15, bendStrength: 11.5)
- ✅ Integrated FloatingLines into Login page
  - Added to page background with 70% opacity (darker)
  - Configuration: 14 lines, distance 70, interactive mode enabled
  - Three wave layers with gradient colors (orange → orange → cyan)
  - Enhances visual appeal of authentication interface
  - WebGL detection with graceful degradation (no crash without WebGL)
- ✅ Added FloatingLines.css
  - Container styles for full-screen rendering
  - Supports mixBlendMode customization

**MongoDB Integration & Statistics Migration:**
- ✅ Ported Discord bot statistics logic (JavaScript → Python)
  - Created backend/services/mongo_service.py with Singleton pattern
  - Created backend/services/stats_service.py with calculation functions
  - Implemented calc_vehicle_time(), calc_vehicle_kills(), format_time()
  - Ported ranking system (get_user_high_score_and_group)
- ✅ Implemented stats API endpoints
  - GET /api/stats/:steamId - full player statistics
  - GET /api/stats/search/:playerName - player search
  - GET /api/stats/leaderboard - top players with sorting
  - GET /api/stats/ranks - ranking configuration

**Previous Changes:**
- Converted all .tsx files to .jsx (TypeScript removed)
- Implemented PostgreSQL database with SQLAlchemy ORM
- Created Flask backend with CRUD endpoints for clans
- Restructured project: Frontend/ (React), backend/ (Flask), static/ (uploads)
- Added JSONB fields for complex data (requirements, stats snapshots)
- Configured CASCADE deletes for referential integrity
- Updated .gitignore for Python and uploads

## Project Structure

```
/
├── Frontend/              # React приложение
│   ├── src/              # Исходный код
│   │   ├── components/   # UI компоненты (55+ shadcn компонентов)
│   │   ├── pages/        # Страницы приложения
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Утилиты и helpers
│   │   ├── data/         # Mock данные для разработки
│   │   ├── App.jsx       # Главный компонент приложения
│   │   ├── main.jsx      # Точка входа React
│   │   └── index.css     # Глобальные стили
│   ├── public/           # Статические файлы
│   ├── index.html        # HTML шаблон
│   ├── vite.config.js    # Конфигурация Vite
│   └── postcss.config.js # Конфигурация PostCSS/Tailwind
│
├── backend/              # Flask бэкенд (REST API)
│   ├── app.py           # Точка входа Flask
│   ├── config.py        # Конфигурация
│   ├── requirements.txt # Python зависимости
│   ├── models/          # SQLAlchemy модели (PostgreSQL)
│   ├── routes/          # API endpoints
│   └── services/        # Бизнес-логика (будет добавлено)
│
├── static/               # Загружаемый контент
│   └── uploads/          # Пользовательские файлы
│       ├── avatars/      # Аватары игроков
│       ├── clan-logos/   # Логотипы кланов
│       └── clan-banners/ # Баннеры кланов
│
├── attached_assets/      # Ассеты проекта (изображения, шрифты)
│
├── package.json          # Зависимости npm
├── package-lock.json     # Lock file для npm
├── .gitignore            # Git ignore файл
├── README.md             # Документация проекта
└── replit.md             # Техническая документация
```

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React 19 (Vite-based build system)
- Pure JavaScript/JSX (no TypeScript)
- shadcn/ui component library with Radix UI primitives
- TailwindCSS for styling with custom gaming theme
- TanStack Query for data fetching and state management

**Design Patterns:**
- Component-based architecture with UI components in `client/src/components/ui/`
- All components written in pure JSX (55+ UI components)
- Custom hooks for business logic (e.g., `useSquadStats.js`, `use-toast.js`)
- Mock data layer for development (`client/src/data/mockSquadStats.js`)
- Calculation utilities separated into pure functions (`client/src/lib/statsCalculations.js`)

**Key Architectural Decisions:**
- Gaming-focused theme with custom fonts (Oxanium, Rajdhani, Inter) and dark color scheme
- Russian language documentation and comments throughout codebase
- Statistics calculations ported from Discord bot to web interface
- All TypeScript removed - pure JavaScript implementation

### Backend Architecture

**Technology Stack:**
- Flask 3.0 (Python web framework)
- PostgreSQL (Neon-hosted via Replit integration)
- SQLAlchemy ORM for database operations
- Flask-CORS for cross-origin requests
- Gunicorn for production deployment

**Database Schema:**
- **players**: UUID, steam_id (unique), username, discord_id, current_clan_id
- **clans**: UUID, name, tag (unique), theme (orange|blue|yellow), JSONB requirements, timestamps
- **clan_members**: UUID, UNIQUE(clan_id, player_id), role (owner|member), JSONB stats_snapshot, CASCADE deletes
- **clan_applications**: UUID, status (pending|accepted|rejected), JSONB stats_snapshot, CASCADE deletes

**API Endpoints (Implemented):**
- `GET /api/clans` - список всех кланов
- `GET /api/clans/:id` - информация о клане с участниками
- `POST /api/clans` - создание клана (валидация theme, JSON)
- `PUT /api/clans/:id` - обновление клана
- `DELETE /api/clans/:id` - удаление клана (CASCADE для связей)
- `GET /api/clans/:id/members` - список участников клана

**Key Features:**
- UUID primary keys для всех таблиц
- JSONB поля для complex data (requirements, stats_snapshot)
- CASCADE deletes для сохранения целостности данных
- Валидация JSON в POST/PUT (возврат 400 при ошибках)
- CORS настроен для работы с фронтендом

**Development Setup:**
- Vite dev server runs on port 5000
- Hot Module Replacement (HMR) enabled
- Replit-specific plugins for enhanced development experience

### Data Storage Solutions

**PostgreSQL Database (Replit-hosted Neon):**
- Players: UUID PK, steam_id (unique), username, discord_id, current_clan_id
- Clans: UUID PK, name, tag (unique), theme, JSONB requirements, timestamps
- Clan Members: UUID PK, UNIQUE(clan_id, player_id), role, JSONB stats_snapshot, CASCADE deletes
- Clan Applications: UUID PK, status (pending|accepted|rejected), JSONB stats_snapshot, CASCADE deletes
- SQLAlchemy ORM with migrations support

**MongoDB Statistics Integration (SquadJS):**
- **Implemented** - graceful degradation without MongoDB
- Collections: `mainstats` (player stats), `configs` (ranking system)
- Read-only access pattern - web app consumes but doesn't modify
- Connection via MONGO_URI environment variable
- Statistics include: kills, deaths, K/D ratio, match history, role time, weapon usage, vehicle time
- Flexible schema support with safe field extraction (handles nested objects and missing fields)

**Mock Data (Development):**
- Frontend: `client/src/data/mockSquadStats.js` for development without MongoDB
- All statistics calculations work with both mock and real data

### External Dependencies

**Game Server Integration:**
- **SquadJS MongoDB Database**: Contains real-time player statistics from Squad game server
  - Collections: `mainstats`, `config` (ranking system)
  - Data structure mirrors Discord bot expectations
  - Accessed via MongoDB connection string (not yet implemented in web app)

**Planned External Services:**
- **Steam API**: Player authentication and profile data (marked as future integration)
- **Discord OAuth**: User authentication via Discord (structure exists, not implemented)
- **Discord Bot**: Shares MongoDB statistics database with web platform

**UI Component Library:**
- shadcn/ui components built on Radix UI primitives
- Extensive component library (~40 UI components)
- Fully themed for gaming aesthetic

**Development Tools:**
- Replit-specific plugins for development experience
- Vite dev server with HMR support
- ESBuild for production builds

**Key Integration Points:**
- **Backend Integration Complete**: Flask API with PostgreSQL and MongoDB
- **Statistics Logic Ported**: Discord bot calculations (JS → Python) in backend/services/stats_service.py
  - Vehicle time calculations (heavy vehicles, helicopters)
  - Vehicle kills tracking
  - Weapon categorization
  - Ranking system (scoreGroups)
  - Time formatting utilities
- **API Endpoints**: 
  - `/api/clans` - CRUD operations (PostgreSQL)
  - `/api/stats/:steamId` - player statistics (MongoDB)
  - `/api/stats/search/:playerName` - search players
  - `/api/stats/leaderboard` - top players with sorting
  - `/api/stats/ranks` - ranking configuration
- **Graceful Degradation**: Backend works without MongoDB (returns 503 for stats endpoints)
- **Flexible Schema**: safe_int() helpers handle variations in SquadJS MongoDB structure
- Session management infrastructure prepared but not implemented

### Authentication & Authorization

**Current State:**
- No authentication implemented - frontend only application
- Mock user data displayed for demonstration purposes

**Planned Approach:**
- Integration with external authentication service (Steam, Discord OAuth)
- Role-based access: Guest, Member (clan member), Owner (clan leader)
- Different UI and capabilities based on user role
- Backend service required for secure authentication implementation

### Statistics System

**Calculation Engine:**
- Complex calculations ported from Discord bot JavaScript
- Functions for vehicle time, kill types, rank progression, weapon/role analysis
- Support for 35+ vehicle types, 60+ weapon patterns, rank progression system
- Time formatting and aggregation utilities

**Data Categories:**
- Player performance: kills, deaths, K/D ratio, revives, teamkills
- Match statistics: total matches, wins, win rate, commander matches
- Time tracking: total playtime, squad leader time, commander time
- Role analysis: time spent in each infantry role with detailed breakdown
- Weapon proficiency: kills per weapon with categorization
- Vehicle statistics: time in vehicles (heavy/helicopters), vehicle kills
- Ranking system: score-based progression with visual rank display

**Architecture Choice Rationale:**
- Client-side calculations reduce backend load
- Allows offline/mock development
- Maintains consistency with existing Discord bot implementation
- Statistics updated asynchronously from game server - no real-time requirements