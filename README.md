# CS2 Lineups

Interactive grenade lineup database for Counter-Strike 2. Smokes, flashes, molotovs and HE grenades for all competitive maps. Discord/Google auth, comments, media uploads.

## Stack

- **Next.js 16** + React 19 + TypeScript
- **Tailwind CSS 4**
- **Framer Motion**
- **React-Leaflet** — interactive radar maps
- **Supabase** — PostgreSQL + Auth + Storage
- **Upstash Redis** — rate limiting
- **Netlify** — deployment

## Setup

```bash
git clone https://github.com/mrkiwjr/cs2-lineups.git
cd cs2-lineups
npm install
cp .env.example .env.local
```

Fill in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
UPSTASH_REDIS_REST_URL=https://your-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
```

Run:

```bash
npm run dev
```

## Docker

```bash
npm run docker:dev      # dev with hot reload
npm run docker:build    # production image
npm run docker:start    # run production container
npm run docker:stop     # stop
npm run docker:clean    # remove containers and images
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── lineups/        # CRUD
│   │   ├── comments/       # CRUD
│   │   ├── favorites/      # toggle
│   │   ├── upload/         # media upload
│   │   ├── views/          # view counter
│   │   └── health/         # health check
│   ├── auth/
│   │   ├── callback/       # OAuth callback
│   │   └── error/          # auth error page
│   ├── app/                # main app (lineup viewer)
│   ├── layout.tsx
│   └── page.tsx            # landing page
├── components/
│   ├── auth/               # AuthButton, AuthProvider
│   ├── comments/           # CommentSection, CommentItem
│   ├── detail/             # DetailPanel
│   ├── layout/             # Topbar, Sidebar
│   └── map/                # MapArea, MapInner
├── hooks/
│   ├── useLineups.ts       # data fetching
│   └── useFilters.ts       # URL hash state
├── lib/
│   ├── constants/          # maps, labels, callouts
│   ├── supabase/           # client + server
│   ├── types/              # TypeScript definitions
│   └── utils/              # validation, rate-limit, api-response, auth-helpers
└── middleware.ts
```

## Features

**Public:**

- 1300+ lineups across 7 maps (Mirage, Inferno, Dust 2, Nuke, Anubis, Ancient, Overpass)
- Filter by grenade type and side (T/CT)
- Interactive radar map with clustered markers and throw trajectories
- Deep links via URL hash (`#mirage/smoke/T`)
- Detail panel with screenshots, video embeds, descriptions
- Image optimization via next/image

**Authenticated:**

- Discord / Google login
- Create lineups with media
- Favorites
- Comments (create, edit, delete)
- Screenshot and video upload (10MB limit)

## API

| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/lineups` | — |
| POST | `/api/lineups` | yes |
| PUT | `/api/lineups/[id]` | yes |
| DELETE | `/api/lineups/[id]` | yes |
| GET | `/api/favorites` | yes |
| POST | `/api/favorites` | yes |
| DELETE | `/api/favorites` | yes |
| GET | `/api/comments?lineup_id=` | — |
| POST | `/api/comments` | yes |
| PUT | `/api/comments/[id]` | yes |
| DELETE | `/api/comments/[id]` | yes |
| POST | `/api/upload` | yes |
| POST | `/api/views` | — |
| GET | `/api/health` | — |

## Security

- Input validation on all endpoints (enum checks, length limits, type guards)
- PostgREST pattern escaping (ilike injection prevention)
- Rate limiting via Upstash Redis (60/min public, 20/min writes, 10/min uploads)
- File upload validation: MIME type + extension + magic bytes
- JWT Bearer token auth with atomic ownership checks (no TOCTOU)
- CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- RLS on all Supabase tables
- Error sanitization (no DB details leaked to client)

## Database

6 tables + 2 views in Supabase:

- `profiles` — auto-created on OAuth signup
- `lineups` — grenade lineups with author
- `favorites` — user-lineup bookmarks
- `lineup_views` — unique views per IP
- `comments` — with cascade delete
- `map_positions` — radar marker coordinates
- `lineup_view_count` / `lineup_favorites_count` — aggregate views

## Deploy

Netlify:

```bash
npm run build
```

Environment variables in Netlify Dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
