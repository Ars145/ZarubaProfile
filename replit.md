# ZARUBA Gaming Community Platform

## Overview
ZARUBA is a tactical gaming community platform for Squad server players, offering player profiles, clan management, and detailed game statistics. It integrates a React frontend with existing Squad server infrastructure (MongoDB statistics) and a Discord bot ecosystem. The platform aims to enhance player engagement by providing statistics, clan functionality, and a ranking system based on in-game performance.

## Recent Changes (Nov 23, 2025)

### ADMIN Role Implementation
- **Admin Role System**: Захардкожены три Steam ID администраторов в backend/config.py (ADMIN_STEAM_IDS)
  - `76561199104736343` (Админ 1)
  - `76561198046223350` (Админ 2)
  - `76561198890001608` (Владелец проекта)
- **Backend Admin Checks**: 
  - /api/auth/me теперь возвращает поле isAdmin (проверяется на бэкенде по Steam ID)
  - /api/clans POST требует авторизацию и проверяет права админа
  - Новый endpoint /api/admin/clans/<clan_id>/assign-owner для назначения владельцев кланов админами
  - Поддержка назначения owner при создании клана (параметр ownerId)
- **Frontend Admin Panel**:
  - Создана страница Admin Panel (/admin) с двумя основными функциями
  - Форма создания клана с опциональным назначением owner
  - Форма назначения владельца существующему клану
  - Список всех кланов в системе
  - Навигационная кнопка "Админ" видна только для администраторов
  - Redirect на главную для не-админов при попытке доступа к /admin

---

## Previous Changes
- **Frontend-API Integration**: Connected frontend to real backend APIs, removed all mock data
  - useSquadStats hook refactored to use TanStack Query with /api/stats/:steamId endpoint with credentials
  - Profile page updated with proper auth checks and loading/error states for statistics
  - Created clan pages (list, detail) with real API integration
- **Navigation**: Added header with navigation menu (Profile, Clans) and user dropdown
- **Backend Improvements**: 
  - Added PostgreSQL connection pool settings (pool_pre_ping, pool_recycle) to handle SSL connection stability
  - **FIXED: 503 errors** - Stats API now returns HTTP 200 with empty stats when MongoDB unavailable (graceful degradation)
- **Critical Bug Fixes**:
  - **FIXED: Frontend crash** - useSquadStats now safely handles empty stats responses without nested fields
  - Added early return with minimal stats object when MongoDB data unavailable
  - All nested field access now uses optional chaining (?.) and fallback values
  - Fixed field name mismatches (playerData._id vs steamId, death vs deaths, etc.)
  - **FIXED: All components** - squad-stats-compact.jsx and profile.jsx now safely handle missing nested stats
  - All rank.progress, topWeapon, topRole accesses protected with optional chaining and fallbacks
- **Mock Data Cleanup**: 
  - Removed mockSquadStats.js and all mock data dependencies
  - Removed hardcoded fake clans array from profile.jsx
  - Removed unused banner/logo imports (alphaBanner, wolfLogo)
  - Added proper loading/error states for "Боевая Статистика" card
  - Replaced undefined variables with safe defaults (null for clan assets, empty array for clans list)

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend uses React 19 with a Vite-based build system, pure JavaScript/JSX, shadcn/ui components (built on Radix UI primitives), and TailwindCSS with a custom gaming theme. Data fetching and state management are handled by TanStack Query. Key decisions include a component-based architecture, custom hooks for logic, and a gaming-focused dark theme with custom fonts. All TypeScript has been removed in favor of pure JavaScript.

### Backend Architecture
The backend is built with Flask 3.0, using PostgreSQL (Neon-hosted) via SQLAlchemy ORM. It provides REST API endpoints for managing clans and retrieving player statistics. Key features include UUID primary keys, JSONB fields for complex data, CASCADE deletes for data integrity, and JSON validation. Flask-CORS is used for cross-origin requests, and Gunicorn is used for production.

### Data Storage Solutions
**PostgreSQL Database (Replit-hosted Neon):** Stores player, clan, clan member, and clan application data using SQLAlchemy ORM.
**MongoDB Statistics Integration (SquadJS):** Consumes read-only player statistics from the Squad game server's MongoDB. This integration includes calculating vehicle time, kills, and a ranking system. The system supports graceful degradation if MongoDB is unavailable.

### Authentication & Authorization
**Discord OAuth** is fully implemented for user authentication, including account linking and unlinking. User sessions are managed with JWT tokens stored in cookies. The `@require_auth` decorator secures all protected endpoints and provides `request.current_player` for accessing authenticated player data. Role-based access control (Guest, Member, Owner) is enforced across clan management endpoints.

**Steam Authentication** is planned for future implementation to provide additional player verification and profile data.

### Statistics System
A robust calculation engine, ported from the Discord bot's JavaScript logic to Python, processes complex statistics. It supports 35+ vehicle types, 60+ weapon patterns, and a comprehensive ranking system. Data categories include player performance (K/D, revives), match statistics, time tracking (playtime, commander time), role analysis, weapon proficiency, and vehicle statistics. Calculations are primarily client-side to reduce backend load and maintain consistency with the existing Discord bot.

### Clan Management System
**Complete Implementation** with 15+ REST API endpoints covering:

**Data Models:**
- **Clan:** Basic clan info with name, tag, description, logo, and owner relationship
- **ClanMember:** Membership records with role (owner/member), join dates, and stats snapshots
- **ClanApplication:** Player applications with status tracking (pending/accepted/rejected/cancelled)
- **ClanInvitation:** Owner-sent invitations with status tracking and invited_by relationship

**Core Features:**
- **Clan CRUD:** Create, read, update, delete clans (owner-only operations)
- **Member Management (4 endpoints):**
  - Join open clans
  - Leave clan (owners must transfer ownership first)
  - Kick members (owner-only)
  - Change member roles with transactional ownership transfer (ensures exactly one owner at all times)
  
- **Application System (5 endpoints):**
  - Submit applications with current stats snapshot
  - View clan applications (owner-only)
  - View personal applications
  - Approve/reject applications with duplicate membership prevention
  - Withdraw pending applications
  
- **Invitation System (6 endpoints):**
  - Create invitations (owner-only)
  - View personal invitations
  - View clan invitations (owner-only)
  - Accept invitations with membership checks
  - Reject invitations
  - Cancel invitations (owner-only)

**Key Design Decisions:**
- RESTful resource identification using `ClanMember.id` (not `player_id`) in URL paths
- Transactional safety: ownership transfers promote target first, then demote others to prevent ownerless clans
- Defensive checks prevent duplicate memberships (reject applications/invitations if player joined another clan)
- Single source of truth: `Player.current_clan_id` synced with `ClanMember` records
- Unique constraints prevent duplicate applications per player per clan
- CASCADE deletes maintain data integrity when clans or players are removed

## External Dependencies

*   **SquadJS MongoDB Database:** Used for real-time player statistics from the Squad game server (`mainstats`, `config` collections).
*   **Steam API:** (Planned) For player authentication and profile data.
*   **Discord OAuth:** (Implemented) For user authentication via Discord, including linking and unlinking accounts.
*   **shadcn/ui & Radix UI primitives:** Frontend UI component libraries.
*   **Vite:** Frontend build tool.
*   **TailwindCSS:** CSS framework.
*   **TanStack Query:** Data fetching and state management.
*   **Flask:** Backend web framework.
*   **PostgreSQL (Neon):** Primary database.
*   **SQLAlchemy:** Python ORM for PostgreSQL.
*   **Gunicorn:** WSGI HTTP Server for Python applications.