# ZARUBA Gaming Community Platform

## Overview
ZARUBA is a tactical gaming community platform for Squad server players. It offers player profiles, comprehensive clan management, and detailed game statistics. The platform integrates a React frontend with existing Squad server infrastructure (MongoDB statistics) and a Discord bot ecosystem, aiming to enhance player engagement through statistics, clan functionality, and an in-game performance-based ranking system.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
The frontend uses React with a Vite-based build system, pure JavaScript/JSX, shadcn/ui components (built on Radix UI primitives), and TailwindCSS. A custom gaming-focused dark theme with custom fonts is applied.

### Technical Implementations
The backend is built with Flask 3.0, utilizing PostgreSQL (Neon-hosted) via SQLAlchemy ORM. It provides REST API endpoints for clan management and player statistics. Data fetching and state management on the frontend are handled by TanStack Query. All TypeScript has been removed in favor of pure JavaScript.

### Feature Specifications
-   **Player Profiles:** Displays detailed player statistics.
-   **Clan Management System:** A complete system with 15+ REST API endpoints covering Clan CRUD, member management (join, leave, kick, role changes), an application system (submit, view, approve/reject, withdraw), and an invitation system (create, view, accept/reject, cancel). It ensures transactional safety for ownership transfers and prevents duplicate memberships.
-   **Statistics System:** A robust calculation engine, ported from a Discord bot, processes complex statistics including vehicle time, kills, and a comprehensive ranking system. It supports 35+ vehicle types and 60+ weapon patterns, with calculations primarily client-side.
-   **Admin Panel:** Provides functionality for creating clans, assigning owners using Steam IDs, and listing all clans. Access is restricted to predefined administrators.

### System Design Choices
-   **Authentication & Authorization:** Discord OAuth is fully implemented for user authentication, managing sessions with JWT tokens. The `@require_auth` decorator secures endpoints, and role-based access control (Guest, Member, Owner) is enforced. Steam authentication is planned.
-   **Data Storage:** PostgreSQL stores player, clan, member, and application data with UUID primary keys, JSONB fields, and CASCADE deletes. The `clan_applications` table uses `player_id UUID` foreign key (legacy `player_name`/`player_steam_id` fields removed Nov 2025) with UNIQUE constraint on `(clan_id, player_id)`. MongoDB is used for read-only Squad game server statistics, with graceful degradation if unavailable.
-   **API Design:** Backend APIs return an envelope (`{success: true, data: ...}`), which the frontend automatically unwraps for consistent data handling.
-   **File Uploads:** PNG transparency is fully supported - FileService detects RGBA/LA/P image modes and preserves transparency by saving as PNG instead of JPEG. Relative URLs (`/api/static/uploads/...`) are generated for uploaded clan logos and banners, working seamlessly in development (via Vite proxy) and production. Upload endpoints are secured with authentication and ownership verification. Static file route `/api/static/uploads/<path>` properly serves nested subdirectories using absolute upload paths.
-   **Error Handling:** The stats API returns HTTP 200 with empty stats if MongoDB is unavailable to prevent 503 errors and frontend crashes. Optional chaining and fallback values are used for safe access to potentially missing nested data.

## External Dependencies

*   **SquadJS MongoDB Database:** For real-time player statistics.
*   **Discord OAuth:** For user authentication.
*   **shadcn/ui & Radix UI primitives:** Frontend UI components.
*   **Vite:** Frontend build tool.
*   **TailwindCSS:** CSS framework.
*   **TanStack Query:** Data fetching and state management.
*   **Flask:** Backend web framework.
*   **PostgreSQL (Neon):** Primary database.
*   **SQLAlchemy:** Python ORM.
*   **Gunicorn:** WSGI HTTP Server.
*   **Steam API:** (Planned) For player authentication and profile data.