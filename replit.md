# ZARUBA Gaming Community Platform

## Overview

ZARUBA is a tactical gaming community platform built for Squad server players. The application provides player profiles, clan management, and detailed game statistics integration. It features a modern React frontend designed to integrate with existing Squad server infrastructure (MongoDB statistics database) and Discord bot ecosystem.

The platform enables players to view their gaming statistics, join clans, manage clan memberships, and track their progression through a ranking system based on in-game performance.

## User Preferences

Preferred communication style: Simple, everyday language.

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
├── backend/              # Flask бэкенд (будет добавлен)
│   └── data/             # SQLite база данных
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
- **Frontend-only application** - no backend currently implemented
- Gaming-focused theme with custom fonts (Oxanium, Rajdhani, Inter) and dark color scheme
- Russian language documentation and comments throughout codebase
- Statistics calculations ported from Discord bot to web interface
- Client-side mock data for development and demonstration
- All TypeScript removed - pure JavaScript implementation

**Development Setup:**
- Vite dev server runs on port 5000
- Hot Module Replacement (HMR) enabled
- Replit-specific plugins for enhanced development experience

### Data Storage Solutions

**Current Implementation:**
- Mock data only - no backend or database connections
- All statistics displayed from `client/src/data/mockSquadStats.js`

**Future Integration Options:**
- External API for player statistics (MongoDB/SquadJS integration)
- Backend service for clan management and user profiles
- Direct MongoDB connection for statistics (when backend is added)

**Planned External Statistics Database (MongoDB):**
- SquadJS database containing game server statistics
- Collections: `mainstats` (player stats), configuration data
- Read-only access pattern - web app consumes but doesn't modify
- Statistics include: kills, deaths, K/D ratio, match history, role time, weapon usage, vehicle time

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
- Statistics calculation logic ported from Discord bot ensures consistency
- Mock data structure matches MongoDB schema exactly
- Frontend designed to work with or without backend (development flexibility)
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