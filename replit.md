# ZARUBA Gaming Community Platform

## Overview

ZARUBA is a tactical gaming community platform built for Squad server players. The application provides player profiles, clan management, and detailed game statistics integration. It features a modern React frontend with a REST API backend, designed to integrate with existing Squad server infrastructure (MongoDB statistics database) and Discord bot ecosystem.

The platform enables players to view their gaming statistics, join clans, manage clan memberships, and track their progression through a ranking system based on in-game performance.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React (Vite-based build system)
- TypeScript/JavaScript hybrid approach
- shadcn/ui component library with Radix UI primitives
- TailwindCSS for styling with custom gaming theme
- TanStack Query for data fetching and state management

**Design Patterns:**
- Component-based architecture with UI components in `client/src/components/ui/`
- Custom hooks for business logic (e.g., `useSquadStats.js`, `use-toast.js`)
- Mock data layer for development (`client/src/data/mockSquadStats.js`)
- Calculation utilities separated into pure functions (`client/src/lib/statsCalculations.js`)

**Key Architectural Decisions:**
- Gaming-focused theme with custom fonts (Oxanium, Rajdhani, Inter) and dark color scheme
- Russian language documentation and comments throughout codebase
- Statistics calculations ported from Discord bot to web interface
- Client-side mock data allows frontend development independent of backend

### Backend Architecture

**Technology Stack:**
- Express.js REST API server
- TypeScript for type safety
- Drizzle ORM for database operations
- PostgreSQL (Neon serverless) for relational data
- In-memory storage abstraction layer

**Design Patterns:**
- Storage interface pattern (`server/storage.ts`) providing abstraction over data access
- Currently implements `MemStorage` (in-memory) with plan to add PostgreSQL implementation
- Route registration pattern in `server/routes.ts`
- Middleware-based logging and request handling

**Database Schema:**
- Basic user schema defined in `shared/schema.ts` using Drizzle ORM
- Schema includes users table with username/password (placeholder for full implementation)
- Migration system configured via `drizzle.config.ts`

**Planned Features (Not Yet Implemented):**
- Player profiles and statistics endpoints
- Clan management CRUD operations
- Clan application/invitation system
- Integration with PostgreSQL for persistent storage

### Data Storage Solutions

**Primary Database (PostgreSQL):**
- Intended for player profiles, clan data, and application records
- Configured with Neon serverless PostgreSQL
- Drizzle ORM manages schema and migrations
- Connection via `DATABASE_URL` environment variable

**External Statistics Database (MongoDB):**
- Existing SquadJS database containing game server statistics
- Collections: `mainstats` (player stats), configuration data
- Read-only access pattern - web app consumes but doesn't modify
- Statistics include: kills, deaths, K/D ratio, match history, role time, weapon usage, vehicle time

**Storage Architecture Decision:**
- Dual database approach: PostgreSQL for application data, MongoDB for game statistics
- Separation allows leveraging existing Discord bot infrastructure
- Statistics calculations performed client-side using ported Discord bot logic
- No real-time synchronization required - statistics updated periodically by game server

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
- Basic user schema exists but authentication not implemented
- Documentation references Steam and Discord OAuth integration
- Token-based auth patterns visible in API example documentation

**Planned Approach:**
- Integration with main ZARUBA project's authentication system
- Role-based access: Guest, Member (clan member), Owner (clan leader)
- Different UI and capabilities based on user role

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