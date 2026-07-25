# Docker Setup Plan

## Goal
Create Docker configuration for production-grade local deployment and alternative hosting (alternative to Railway/Vercel).

## Files to Create (4 new files)

### 1. `backend/Dockerfile` — Multi-stage Express backend
- **Stage `deps`**: `node:20-alpine`, `npm ci` for all deps
- **Stage `build`**: TypeScript compile (`npm run build`)
- **Stage `production`**: Fresh `node:20-alpine` with only production deps, copy compiled output
- Exposes port 3001, volume-friendly at `/app/data` for SQLite
- Runs with `node --jitless dist/index.js` for smaller container footprint

### 2. `frontend/Dockerfile` — Multi-stage Vite/React frontend
- **Stage `build`**: `node:20-alpine`, `npm ci` → `npm run build`
- **Stage `production`**: `nginx:alpine` serving the built `dist/`
- SPA routing via nginx config (all paths → `/index.html`)
- Exposes port 80, `depends_on: backend` in compose

### 3. `frontend/nginx.conf` — Custom nginx config
- SPA rewrites (match vercel.json behavior: `try_files $uri $uri/ /index.html`)
- Gzip compression for JS/CSS
- Forward `/api` requests to backend (optional — can also use env var)

### 4. `docker-compose.yml` (repo root) — Orchestration
- **`backend`** service:
  - Builds from `./backend`
  - Port `3001:3001`
  - Volume `app-data:/app/data` for SQLite persistence
  - Env vars: `PORT`, `JWT_SECRET`, `CORS_ORIGIN`, `DATABASE_URL`
- **`frontend`** service:
  - Builds from `./frontend`
  - Port `80:80`
  - `depends_on: backend`
  - Env var `VITE_API_URL` passed at build time (build arg) or runtime via nginx proxy
- **`app-data`** named volume for SQLite

## Key Design Decisions

| Decision | Choice | Why |
|---|---|---|
| Frontend serving | nginx | Lightweight, battle-tested static serving |
| Node image | `node:20-alpine` | Matches existing tooling, small (~120MB) |
| Backend runtime | Production deps only | Smaller final image (~150MB vs 1GB+) |
| SQLite persistence | Docker named volume | Survives container restarts, easy backups |
| Ports | 3001 (backend), 80 (frontend) | Matches existing configs |

## Usage

```bash
# Build and start
docker compose up -d

# View logs
docker compose logs -f

# Stop
docker compose down

# Reset DB
docker compose down -v
```

## Out of Scope (for this round)
- Docker Compose `watch` mode for hot-reload dev
- Multi-platform builds (ARM/AMD)
- Healthchecks (additive later)
- Reverse proxy with Caddy/Traefik
