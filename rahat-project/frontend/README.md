# ОРБИТА (ORBITA) — Premium leisure booking

Next.js 16 App Router application for browsing locations, WhatsApp booking requests, favorites, reviews, and an admin panel.

## Quick start (demo mode, no database)

```bash
cd rahat-project/frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- **Admin PIN:** `7777` → `/login` or `/orbita-admin`
- Data is stored in **localStorage** (Zustand persist) when Supabase is not configured.

## Production setup (Supabase)

1. Create a [Supabase](https://supabase.com) project.
2. Run `SUPABASE_SETUP.sql` in the SQL editor.
3. Copy `env.example` → `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server only; required for bookings, favorites, uploads, admin writes)
4. In Netlify: add the same variables under **Site settings → Environment variables**.

```bash
npm run build
npm start
```

## Deploy on Netlify

Repository root contains `netlify.toml`:

- Base directory: `rahat-project/frontend`
- Plugin: `@netlify/plugin-nextjs` (must be in `dependencies`, not only devDependencies)
- Node 20

**Important (fixes Netlify 404 on `/`):**

1. In Netlify UI → **Site configuration → Build & deploy → Build settings**, set **Base directory** to `rahat-project/frontend` (or rely on `netlify.toml`).
2. **Clear "Publish directory"** — leave it empty. Do not use `.next` or `public` manually.
3. Redeploy after pushing these changes.

Push to Git and connect the repo in Netlify. Set Supabase env vars before the first production deploy.

## Architecture

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, Tailwind 4, Zustand |
| API | App Router route handlers (`/api/*`) |
| Database | Supabase (PostgreSQL) |
| Auth | Admin: PIN + cookie `orbita_admin_session`; guests: anonymous `guestId` |
| Storage | Supabase bucket `orbita-images` |

There is **no** separate Express backend; `rahat-project/backend` is unused. `docker-compose.yml` runs Postgres/Redis but the app does not connect to them.

## Routes

| Path | Description |
|------|-------------|
| `/` | Location catalog |
| `/map` | Interactive map |
| `/location/[id]` | Details, booking widget, reviews |
| `/favorites` | Saved locations |
| `/login` | Admin PIN login |
| `/orbita-admin` | Dashboard |
| `/orbita-admin/bookings` | Booking management |
| `/orbita-admin/settings` | Platform settings |

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — production server
- `npm run lint` — ESLint
