# CS2 Lineups

Интерактивная база лайнапов гранат для Counter-Strike 2. Дымы, флэшки, молотовы и HE для всех карт. Авторизация через Discord/Google, комментарии, загрузка медиа.

## Стек

- **Next.js 16** + React 19 + TypeScript
- **Tailwind CSS 4** — стили
- **Framer Motion** — анимации
- **React-Leaflet** — интерактивные карты
- **Supabase** — PostgreSQL + Auth + Storage
- **Netlify** — деплой

## Установка

```bash
git clone https://github.com/mrkiwjr/cs2-lineups.git
cd cs2-lineups
npm install
cp .env.example .env.local
```

Заполнить `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your_anon_key
```

Запуск:

```bash
npm run dev
```

## Структура

```
src/
├── app/
│   ├── api/
│   │   ├── lineups/        # CRUD лайнапов
│   │   ├── comments/       # CRUD комментариев
│   │   ├── favorites/      # Избранное
│   │   ├── upload/         # Загрузка медиа
│   │   └── views/          # Счётчик просмотров
│   ├── auth/
│   │   ├── callback/       # OAuth callback
│   │   └── error/          # Ошибка авторизации
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Главная страница
├── components/
│   ├── auth/
│   │   ├── AuthButton.tsx  # Кнопка входа + дропдаун
│   │   └── AuthProvider.tsx # Контекст авторизации
│   ├── comments/
│   │   ├── CommentSection.tsx # Секция комментариев
│   │   └── CommentItem.tsx    # Отдельный комментарий
│   ├── detail/
│   │   └── DetailPanel.tsx # Панель деталей лайнапа
│   ├── layout/
│   │   ├── Topbar.tsx      # Навигация + карты
│   │   └── Sidebar.tsx     # Фильтры + список лайнапов
│   └── map/
│       ├── MapArea.tsx     # Обёртка карты (SSR-safe)
│       └── MapInner.tsx    # Leaflet карта + маркеры
├── hooks/
│   ├── useLineups.ts       # Загрузка лайнапов из Supabase
│   └── useFilters.ts       # Фильтры + hash-роутинг
├── lib/
│   ├── constants/
│   │   ├── maps.ts         # 7 карт + позиции
│   │   └── labels.ts       # Лейблы, цвета, иконки
│   ├── supabase/
│   │   ├── client.ts       # Браузерный клиент
│   │   └── server.ts       # Серверный клиент
│   ├── types/              # TypeScript типы
│   └── utils/              # Хелперы
└── middleware.ts            # Auth session refresh
```

## Основные функции

**Всем пользователям:**

- Просмотр 48 лайнапов на 7 картах (Mirage, Inferno, Dust 2, Nuke, Anubis, Ancient, Overpass)
- Фильтрация по типу гранаты (дым, флэш, молотов, HE) и стороне (T/CT)
- Интерактивная карта с маркерами + траектория броска
- Прямые ссылки на фильтры (`#mirage/smoke/T`)
- Детальная панель с видео, инструкцией, описанием

**Авторизованным:**

- Вход через Discord / Google
- Добавление лайнапов с описанием и видео
- Избранное
- Комментарии (создание, редактирование, удаление)
- Загрузка скриншотов и видео

## База данных

6 таблиц + 2 views в Supabase:

- `profiles` — пользователи (auto-create при OAuth)
- `lineups` — лайнапы с автором
- `favorites` — связка юзер-лайнап
- `lineup_views` — уникальные просмотры по IP
- `comments` — комментарии с каскадным удалением
- `map_positions` — координаты точек на картах
- `lineup_view_count` / `lineup_favorites_count` — агрегирующие views

RLS-политики: SELECT открыт для всех, INSERT/UPDATE/DELETE — только автор.

## API Routes

| Метод | Endpoint | Описание | Auth |
|-------|----------|----------|------|
| GET | `/api/lineups` | Список с фильтрами | — |
| POST | `/api/lineups` | Создать лайнап | да |
| PUT | `/api/lineups/[id]` | Обновить (автор) | да |
| DELETE | `/api/lineups/[id]` | Удалить (автор) | да |
| GET | `/api/favorites` | Мои избранные | да |
| POST | `/api/favorites` | Добавить | да |
| DELETE | `/api/favorites` | Убрать | да |
| GET | `/api/comments` | Комменты к лайнапу | — |
| POST | `/api/comments` | Написать | да |
| PUT | `/api/comments/[id]` | Редактировать (автор) | да |
| DELETE | `/api/comments/[id]` | Удалить (автор) | да |
| POST | `/api/upload` | Загрузка медиа | да |

## Безопасность

- JWT Bearer token авторизация на всех защищённых эндпоинтах
- Owner-check: редактировать/удалять может только автор
- Whitelist полей при создании (защита от mass assignment)
- Upload: только jpg/png/webp/gif/mp4, лимит 10MB
- Open redirect защита в OAuth callback
- Security headers: X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- RLS на всех таблицах Supabase
- Ошибки БД не утекают клиенту

## Деплой

Netlify:

```bash
npm run build
```

Environment variables в Netlify Dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
