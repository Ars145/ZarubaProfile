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

### Frontend (Vite dev server)

```bash
npm run dev
```

Frontend будет доступен на `http://localhost:5000`

### Backend (Flask API)

```bash
# Установить зависимости Python
cd backend
pip install -r requirements.txt

# Создать .env файл с DATABASE_URL

# Запустить сервер
python app.py
```

Backend API будет доступен на `http://localhost:8000`

### Сборка Frontend

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
