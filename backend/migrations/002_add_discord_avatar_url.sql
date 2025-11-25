-- Миграция: Добавление отдельного поля для Discord аватарки
-- Дата: 25 ноября 2024
-- Описание: Добавляем discord_avatar_url чтобы НЕ перезаписывать Steam аватарку при привязке Discord

-- Добавить колонку discord_avatar_url
ALTER TABLE players ADD COLUMN IF NOT EXISTS discord_avatar_url TEXT;

-- Комментарий для будущих разработчиков
COMMENT ON COLUMN players.discord_avatar_url IS 'Discord avatar URL (отдельно от Steam avatar_url)';
