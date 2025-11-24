-- Migration: Remove max_members column
-- Date: 2024-11-24
-- Description: Удаление ограничения max_members из кланов

ALTER TABLE clans DROP COLUMN IF EXISTS max_members;
