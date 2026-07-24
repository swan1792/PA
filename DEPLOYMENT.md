# Deployment Guide

This project is deployed with **CI/CD** using **GitHub Actions**:
- **Frontend** → [Vercel](https://vercel.com)
- **Backend** → [Railway](https://railway.app)

## Prerequisites

- GitHub repository with `main` and `development` branches
- [Vercel](https://vercel.com) account (GitHub login)
- [Railway](https://railway.app) account (GitHub login)

---

## 1. Backend — Railway Setup

### 1.1 Create a Railway Project

1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
2. Select your repo
3. Railway auto-detects `railway.json` and the `backend/Dockerfile`
4. Railway will set `rootDirectory` to `backend` and build the Dockerfile

### 1.2 Set Environment Variables

In your Railway project dashboard → **Variables**, add:

| Variable | Value |
|---|---|
| `PORT` | `3001` |
| `JWT_SECRET` | (generate a secure random string) |
| `CORS_ORIGIN` | `https://your-vercel-app.vercel.app` |
| `DATABASE_URL` | `file:./data/app.db` (local SQLite, good for dev) |

> **For production persistence**, use [Turso](https://turso.tech) — a cloud SQLite:
> 1. Install Turso CLI: `curl -sSfL https://get.turso.tech | bash`
> 2. Create a DB: `turso db create pa-app`
> 3. Get the URL + token: `turso db show pa-app` and `turso db tokens create pa-app`
> 4. Set `DATABASE_URL=libsql://your-db.turso.io` and `TURSO_AUTH_TOKEN=your-token`

### 1.3 Get Railway Token for CI/CD

1. In Railway dashboard → **Settings** → **Tokens** → **Generate Token**
2. Copy the token
3. Add it to your GitHub repo: **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `RAILWAY_TOKEN`
   - Value: (paste the token)

---

## 2. Frontend — Vercel Setup

### 2.1 Import the Project

1. Go to [vercel.com](https://vercel.com) → **Add New Project** → **Import Git Repository**
2. Select your repo
3. **Framework preset**: `Vite`
4. **Root directory**: `frontend`
5. **Build command**: `npm run build`
6. **Output directory**: `dist`

### 2.2 Set Environment Variables

In Vercel project → **Settings → Environment Variables**, add:

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://your-railway-app.up.railway.app/api` |

> Replace with your actual Railway backend URL. It looks like `https://pa-app-backend.up.railway.app`.

### 2.3 Get Vercel Token for CI/CD

1. Go to [vercel.com/account/tokens](https://vercel.com/account/tokens) → **Create Token**
2. Copy the token
3. Add it to your GitHub repo secrets:
   - Name: `VERCEL_TOKEN`
   - Value: (paste the token)

---

## 3. CI/CD — GitHub Actions

The workflow (`.github/workflows/deploy.yml`) runs on every push:

| Event | Actions |
|---|---|
| Push to `development` | Runs **TypeCheck & Lint** only |
| Push to `main` | Runs **TypeCheck & Lint** → **Deploy to Railway** → **Deploy to Vercel** |
| PR to `main` | Runs **TypeCheck & Lint** only |

### Required GitHub Secrets

| Secret | Where to get it |
|---|---|
| `RAILWAY_TOKEN` | Railway dashboard → Settings → Tokens |
| `VERCEL_TOKEN` | [vercel.com/account/tokens](https://vercel.com/account/tokens) |

---

## 4. Manual Deploy (no CI/CD)

### Backend (Railway)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
cd backend
railway link

# Deploy
railway up
```

### Frontend (Vercel)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel --prod
```

---

## 5. Architecture

```
                     Railway                        Vercel
                 ┌─────────────┐              ┌──────────────┐
                 │   Backend   │              │   Frontend   │
  Browser ───────┤  Express.js │◄──API calls──┤  Vite/React  │
                 │   SQLite    │              │  TailwindCSS │
                 └─────────────┘              └──────────────┘
                       │
                       ▼
                   file:./data/app.db
                  (or Turso cloud DB)
```

## 6. Environment Files

| File | Purpose |
|---|---|
| `backend/.env` | Local backend (DB, JWT secret, CORS) |
| `frontend/.env` | Local frontend (API URL override) |
| `backend/Dockerfile` | Docker multi-stage build for Railway |
| `railway.json` | Railway project config |
| `frontend/vercel.json` | Vercel SPA rewrites |
| `.github/workflows/deploy.yml` | CI/CD pipeline |
