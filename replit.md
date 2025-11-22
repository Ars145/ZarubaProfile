# ZARUBA Gaming Community Platform

## Overview
ZARUBA is a tactical gaming community platform for Squad server players, offering player profiles, clan management, and detailed game statistics. It integrates a React frontend with existing Squad server infrastructure (MongoDB statistics) and a Discord bot ecosystem. The platform aims to enhance player engagement by providing statistics, clan functionality, and a ranking system based on in-game performance.

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
Currently, there is no authentication implemented, with mock data used for demonstration. The planned approach involves integrating external authentication services like Steam and Discord OAuth, with role-based access control (Guest, Member, Owner) to dictate UI and capabilities.

### Statistics System
A robust calculation engine, ported from the Discord bot's JavaScript logic to Python, processes complex statistics. It supports 35+ vehicle types, 60+ weapon patterns, and a comprehensive ranking system. Data categories include player performance (K/D, revives), match statistics, time tracking (playtime, commander time), role analysis, weapon proficiency, and vehicle statistics. Calculations are primarily client-side to reduce backend load and maintain consistency with the existing Discord bot.

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