# Инструкция: Переход на чистый JavaScript

## Что сделано

✅ Все backend файлы конвертированы в JavaScript:
- `server/index.js`
- `server/routes.js`
- `server/storage.js`
- `server/services/squadStats.js`
- `server/vite.js`
- `shared/schema.js`
- `vite.config.js`

✅ Все TypeScript файлы удалены:
- Удалены все `.ts` файлы из server/ и shared/
- Удалён `tsconfig.json`

## ⚠️ Что нужно сделать ВРУЧНУЮ

Файл `package.json` защищён и я не могу его редактировать автоматически.

### Шаг 1: Замените package.json

Выполните в терминале:

```bash
mv package.json package.json.backup
mv package.json.new package.json
npm install
```

### Шаг 2: Проверьте что изменилось

**Было (TypeScript):**
```json
"dev": "NODE_ENV=development tsx server/index.ts",
"build": "vite build && esbuild server/index.ts ...",
```

**Стало (JavaScript):**
```json
"dev": "NODE_ENV=development node server/index.js",
"build": "vite build && esbuild server/index.js ...",
```

### Шаг 3: Удалены TypeScript зависимости

Из devDependencies удалены:
- `@types/connect-pg-simple`
- `@types/express`
- `@types/express-session`
- `@types/node`
- `@types/passport`
- `@types/passport-local`
- `@types/react`
- `@types/react-dom`
- `@types/ws`
- `tsx` (TypeScript execution engine)
- `typescript`

### Шаг 4: Запустите приложение

После замены package.json:

```bash
npm run dev
```

Приложение запустится на чистом JavaScript без TypeScript!

## Проверка

Убедитесь что:
- ✅ Сервер запускается на порту 5000
- ✅ API endpoints работают: /api/clans, /api/stats/:steamId
- ✅ PostgreSQL подключена
- ✅ MongoDB mock данные работают

## Откат (если что-то пошло не так)

```bash
mv package.json.backup package.json
npm install
```
