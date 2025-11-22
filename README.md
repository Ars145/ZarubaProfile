# ZARUBA Gaming Community Platform

Платформа для игрового сообщества Squad с профилями игроков, статистикой и управлением кланами.

## 📁 Структура проекта

```
/
├── Frontend/              # React приложение
│   ├── src/              # Исходный код
│   │   ├── components/   # UI компоненты
│   │   ├── pages/        # Страницы
│   │   ├── hooks/        # Custom hooks
│   │   ├── lib/          # Утилиты
│   │   ├── data/         # Mock данные
│   │   ├── App.jsx       # Главный компонент
│   │   └── index.css     # Стили
│   ├── public/           # Статические файлы
│   ├── index.html        # HTML шаблон
│   ├── vite.config.js    # Конфиг Vite
│   └── postcss.config.js # Конфиг PostCSS
│
├── backend/              # Flask бэкенд (будет добавлен)
│   ├── data/             # SQLite база данных
│   └── (в разработке)
│
├── static/               # Загружаемый контент
│
├── attached_assets/      # Ассеты проекта
│
└── package.json          # Зависимости npm
```

## 🚀 Запуск проекта

### Разработка

```bash
npm run dev
```

Приложение будет доступно на `http://localhost:5000`

### Сборка

```bash
npm run build
```

## 🛠 Технологии

### Frontend
- **React 19** - UI библиотека
- **Vite** - Сборщик и dev сервер
- **TailwindCSS** - CSS фреймворк
- **shadcn/ui** - Компоненты
- **TanStack Query** - Управление данными
- **Wouter** - Маршрутизация

### Стиль кода
- **Pure JavaScript/JSX** - без TypeScript
- **Radix UI** - Accessibility-first примитивы
- **Lucide React** - Иконки

## 📊 Статистика

Приложение отображает игровую статистику Squad:
- K/D соотношение
- Процент побед
- Время игры
- Используемое оружие и роли
- Статистика техники
- Система рангов

## 🔄 Текущий статус

✅ **Готово:**
- Frontend структура
- UI компоненты
- Mock данные для демонстрации
- Тёмная gaming тема

🚧 **В разработке:**
- Backend API (Flask)
- Интеграция с MongoDB статистикой
- Система аутентификации
- Управление кланами

## 📝 Лицензия

MIT
