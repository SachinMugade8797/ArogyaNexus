# ArogyaNexus

Healthcare management platform with a React/Vite frontend and Express authentication API.

## Requirements

- Node.js 20 or newer
- Corepack (included with Node.js)
- PostgreSQL, if using the Prisma database

## Setup and run

```powershell
corepack pnpm install --frozen-lockfile
Copy-Item .env.example .env
corepack pnpm dev:all
```

Set `DATABASE_URL` in `.env` to your PostgreSQL connection string before using database features. The API runs at [http://localhost:3001](http://localhost:3001), with health check at `/api/health`; the Vite frontend runs at [http://localhost:5173](http://localhost:5173).

## Other commands

```powershell
corepack pnpm build
corepack pnpm typecheck
corepack pnpm lint
```
