# ZARUBA Gaming Community Platform

## Overview
ZARUBA is a tactical gaming community platform designed for Squad server players. It aims to enhance player engagement by providing detailed player profiles, comprehensive clan management functionalities, and in-depth game statistics, including a performance-based ranking system. The platform integrates a React frontend with existing Squad server infrastructure (MongoDB statistics) and a Discord bot ecosystem. The overarching business vision is to cultivate a vibrant, competitive, and engaged community around the Squad game.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
The frontend is built with React, utilizing a Vite-based build system, pure JavaScript/JSX, shadcn/ui components (based on Radix UI primitives), and TailwindCSS. It features a custom gaming-focused dark theme with custom fonts to provide a distinct aesthetic.

### Technical Implementations
The backend is developed with Flask 3.0 and uses PostgreSQL (hosted on Neon) with SQLAlchemy ORM. It exposes REST API endpoints for managing clans and player statistics. Data fetching and state management on the frontend are handled by TanStack Query. The project exclusively uses JavaScript for frontend logic, having removed all TypeScript.

### Feature Specifications
-   **Player Profiles:** Displays detailed player statistics.
-   **Clan Management System:** Offers full CRUD operations for clans, member management (join, leave, kick, role changes), an application system (submit, view, approve/reject, withdraw), and an invitation system (create, view, accept/reject, cancel). It ensures transactional safety for ownership transfers and prevents duplicate memberships. Features a hierarchical role system (Owner, Officer, Member, Recruit) with distinct permissions and visual styling. Automatic rejection of other pending applications occurs when one is approved. Members can be managed via dropdowns, and owners cannot demote themselves.
-   **Statistics System:** A calculation engine processes complex statistics including vehicle time, kills, and a comprehensive ranking system, supporting 35+ vehicle types and 60+ weapon patterns. Most calculations occur client-side.
-   **Admin Panel:** Provides administrative functions such as creating clans, assigning owners via Steam IDs, and listing all clans, with access restricted to predefined administrators.

### System Design Choices
-   **Authentication & Authorization:** Discord OAuth is used for user authentication, managing sessions with JWT tokens. Endpoints are secured with an `@require_auth` decorator, and role-based access control (Guest, Member, Owner) is enforced. Steam authentication is planned.
-   **Data Storage:** PostgreSQL stores player, clan, member, and application data, using UUID primary keys, JSONB fields, and CASCADE deletes. A UNIQUE constraint exists on `(clan_id, player_id)` for applications. MongoDB serves as a read-only source for Squad game server statistics, with graceful degradation if unavailable.
-   **API Design:** Backend APIs return an envelope (`{success: true, data: ...}`) which the frontend automatically unwraps.
-   **File Uploads:** Supports PNG transparency by detecting image modes and saving as PNG when transparency is present. Relative URLs are generated for uploaded clan logos and banners. Upload endpoints are secured with authentication and ownership verification. Static files are served from `/api/static/uploads/<path>`.
-   **Error Handling:** The stats API returns HTTP 200 with empty stats if MongoDB is unavailable to prevent server errors. Frontend uses optional chaining and fallback values for data access.
-   **Clan Applications:** Approving an application automatically rejects other pending applications from the same player in a single transaction. All applications related to a player are deleted when they leave or are kicked from a clan.
-   **Real-time Updates:** Role changes and other mutations are reflected immediately in the UI via TanStack Query cache invalidation.

## External Dependencies

-   **SquadJS MongoDB Database:** Used for real-time player statistics.
-   **Discord OAuth:** Used for user authentication.
-   **shadcn/ui & Radix UI primitives:** Used for frontend UI components.
-   **Vite:** Used as the frontend build tool.
-   **TailwindCSS:** Used as the CSS framework.
-   **TanStack Query:** Used for data fetching and state management on the frontend.
-   **Flask:** Used as the backend web framework.
-   **PostgreSQL (Neon):** Used as the primary database.
-   **SQLAlchemy:** Used as the Python ORM for PostgreSQL.
-   **Gunicorn:** Used as the WSGI HTTP Server.
-   **Steam API:** (Planned) For additional player authentication and profile data.
---

## Техническая документация API (Ноябрь 2024)

### Общие принципы

#### Формат ответов
Все API эндпоинты возвращают JSON в формате "envelope":
```json
{
  "success": true/false,
  "data": {...},        // при успехе
  "error": "message"    // при ошибке
}
```

Frontend автоматически "разворачивает" envelope через interceptor в queryClient.

#### Коды статусов HTTP
- `200 OK` - Успешный запрос
- `201 Created` - Ресурс создан
- `400 Bad Request` - Невалидные данные
- `401 Unauthorized` - Требуется авторизация
- `403 Forbidden` - Недостаточно прав
- `404 Not Found` - Ресурс не найден
- `409 Conflict` - Конфликт данных (дубликат)
- `500 Internal Server Error` - Ошибка сервера

#### Авторизация
Эндпоинты с меткой `@require_auth` требуют JWT токен в header:
```
Authorization: Bearer <access_token>
```

### Изменения и миграции (Ноябрь 2024)

#### Удаление max_members
- Удалена колонка `max_members` из таблицы `clans`
- Удалено поле `maxMembers` из всех API ответов
- Удалены все упоминания в UI
- **Миграция:** `backend/migrations/001_remove_max_members.sql`
- **SQL:** `ALTER TABLE clans DROP COLUMN IF EXISTS max_members;`
- **Статус:** Миграция применена в development окружении

#### Система иерархических ролей
- Добавлены роли: Owner, Officer, Member, Recruit
- Визуальная стилизация для каждой роли
- Dropdown меню для смены ролей (только Owner)

#### Auto-rejection заявок
- При одобрении заявки все другие pending заявки этого игрока отклоняются
- Транзакционная безопасность через SQLAlchemy

#### Удаление заявок при leave/kick
- При выходе из клана удаляются ВСЕ заявки игрока в этот клан
- Предотвращает UNIQUE constraint violations при повторной подаче

#### AlertDialog вместо confirm()
- Все подтверждения через кастомные AlertDialog компоненты
- Красивая UI с цветовыми темами (оранжевый для ролей, красный для kick)

#### Real-time обновления
- TanStack Query cache invalidation после каждой мутации
- Немедленное отражение изменений в UI без перезагрузки

#### Discord карточка (Ноябрь 2024)
- **Компактный дизайн:** Уменьшены размеры, отступы и шрифты для более компактного вида
- **Темная цветовая схема:** Изменен градиент с яркого (#5865F2) на темный (#3742a8/#2d3580) для лучшей читаемости
- **Анимации:** Добавлены множественные анимации - вращение логотипа, масштабирование аватара, пульсация иконок
- **AlertDialog подтверждение:** Отвязка Discord теперь использует красивый popup вместо браузерного confirm()
- **Раздельные аватарки:** Добавлено отдельное поле `discord_avatar_url` в модель Player
  - Steam аватарка хранится в `avatar_url` (остается неизменной)
  - Discord аватарка хранится в `discord_avatar_url` (загружается из Discord API)
  - Discord карточка показывает реальную Discord аватарку, а не Steam
- **Backend интеграция:** Discord OAuth callback сохраняет `discord_avatar_url` (`https://cdn.discordapp.com/avatars/{user_id}/{avatar_hash}.png`)
- **Миграция:** `backend/migrations/002_add_discord_avatar_url.sql` - добавление колонки `discord_avatar_url`

### Полная документация API доступна по запросу
Для получения полной документации всех 26+ API эндпоинтов (кланы, игроки, статистика, авторизация, загрузка файлов) обратитесь к разработчику или создайте issue в репозитории.

