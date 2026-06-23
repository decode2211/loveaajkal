# Us, Always 💛

A premium, private long-distance relationship web application built for two people. Dark, warm, elegant — every feature built with love and intentionality.

---

## Features

| Feature | Description |
|---|---|
| 🏠 **Home** | Dual timezone clocks + live countdown to next meetup |
| ✨ **Daily Spark** | One quiz question per day, locked after answering |
| 📜 **Our Codex** | Scrollable timeline of milestones + photo uploads |
| 🌏 **Distance** | Haversine distance with 15+ witty comparisons |
| 🎭 **This or That** | 40 preference questions with alignment dashboard |
| ❤️ **Miss Meter** | 1–100 emotional gauge with sparkline history |
| 🎬 **Watch Together** | Shared queue with drag-to-reorder + live socket reactions |
| ✈️ **Trip Planner** | Flights, places, agenda, and packing checklist |

---

## Tech Stack

**Frontend** — Vite + React 18 + TypeScript, Tailwind CSS v3, Framer Motion v11, React Query v5, Zustand, React Router v6, Socket.io Client

**Backend** — Node.js 20 + Express (TypeScript), Prisma ORM + PostgreSQL, JWT auth (httpOnly cookies), Cloudinary, Socket.io

---

## Prerequisites

- Node.js 20+
- pnpm 8+
- Docker (for PostgreSQL) OR a running PostgreSQL instance
- Cloudinary account (for photo uploads — optional for dev)

---

## Setup

### 1. Clone & install

```bash
git clone <repo>
cd us-always
pnpm install
```

If prompted to approve build scripts, select all four: `@prisma/client`, `@prisma/engines`, `esbuild`, `prisma`.

### 2. Start PostgreSQL

```bash
docker-compose up -d
```

Or configure your own PostgreSQL and update `DATABASE_URL`.

### 3. Configure environment

**Server** — copy `packages/server/.env` and update:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/us_always
JWT_ACCESS_SECRET=your_long_random_secret_here
JWT_REFRESH_SECRET=your_other_long_random_secret_here
PORT=3001
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Client** — `packages/client/.env`:
```env
VITE_API_URL=http://localhost:3001/api/v1
VITE_SOCKET_URL=http://localhost:3001
```

### 4. Database setup

```bash
# Run migrations
pnpm db:migrate

# Seed with initial data (both users + timeline events)
pnpm db:seed
```

### 5. Generate Prisma Client (if not auto-generated)

```bash
cd packages/server
npx prisma generate
```

### 6. Start development servers

Open two terminals:

```bash
# Terminal 1 — Backend
cd packages/server
pnpm dev

# Terminal 2 — Frontend  
cd packages/client
pnpm dev
```

Or from the root (requires parallel execution support):
```bash
pnpm dev
```

App runs at **http://localhost:5173**

---

## Default Login Credentials

Both accounts use password: `password123`

| Person | Username | Display Name |
|---|---|---|
| Person 1 | `person1` | Dev |
| Person 2 | `person2` | Yashika |

> ⚠️ **Change these passwords** in `packages/server/prisma/seed.ts` before running for real use.

---

## Customization

### Change your cities & timezones
Edit `packages/server/prisma/seed.ts` — update `timezone` and `city` for each user. Common timezones: `Asia/Kolkata`, `America/New_York`, `Europe/London`, `Asia/Tokyo`.

### Change distance coordinates
Edit `packages/client/src/features/distance/DistancePage.tsx` — update `PERSON1` and `PERSON2` lat/lng values.

### Add your own timeline events
Use the UI (click "Add Milestone") or edit `packages/server/prisma/seed.ts`.

---

## Database Commands

```bash
pnpm db:migrate      # Run pending migrations
pnpm db:seed         # Seed initial data  
pnpm db:studio       # Open Prisma Studio (visual DB browser)
```

---

## Production Deployment

1. Set `NODE_ENV=production` in server env
2. Use strong, random values for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`
3. Set `CLIENT_URL` to your actual frontend domain
4. Configure Cloudinary properly for photo uploads
5. Run `pnpm -r build` to build all packages
6. Deploy server with `node packages/server/dist/app.js`
7. Serve client's `packages/client/dist` with nginx/Caddy

---

## Project Structure

```
us-always/
├── packages/
│   ├── shared/        # Zod schemas, types, question banks, utilities
│   ├── server/        # Express API + Prisma + Socket.io
│   └── client/        # Vite + React frontend
├── docker-compose.yml
└── pnpm-workspace.yaml
```

---

*Built with love, for love.* 💛
