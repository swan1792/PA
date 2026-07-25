# Deployment Guide

This project is deployed using **free-tier** services with **auto-deploy from GitHub**:

- **Frontend** → [Vercel](https://vercel.com) (React + Vite + Tailwind) — auto-deploys on push
- **Backend** → [Railway](https://railway.app) (Express + TypeScript, Dockerized) — auto-deploys on push
- **Database** → SQLite via Railway Volumes (persistent storage, free tier)
- **No API tokens required** — both platforms connect directly to GitHub

---

## Architecture

```
                         Railway                          Vercel
                    ┌─────────────────────┐        ┌──────────────────┐
                    │     Backend API     │        │     Frontend     │
   Browser ─────────┤   Express.js:3001    │◄──────┤  Vite + React   │
                    │   JWT Auth          │  API   │  TailwindCSS    │
                    │   Zod Validation    │  calls │  Zustand        │
                    └──────────┬──────────┘        └──────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  SQLite (app.db)    │
                    │  Railway Volume     │
                    └─────────────────────┘
```

---

## Prerequisites

Before deploying, ensure you have:

- [GitHub](https://github.com) repository with `main` and `development` branches
- [Vercel](https://vercel.com) account (sign in with GitHub)
- [Railway](https://railway.app) account (sign in with GitHub)
- Node.js 20+ installed locally (for manual deployments)

---

## 1. Environment Variables

### 1.1 Backend (`backend/.env`)

Copy from `backend/.env.example` and fill in:

```env
PORT=3001
JWT_SECRET=<generate-a-secure-random-string>

# CORS — frontend origin for production
CORS_ORIGIN=https://your-vercel-app.vercel.app

# Database — local SQLite (also used in Railway with a Volume)
DATABASE_URL=file:./data/app.db
```

**Generate a strong JWT secret:**
```bash
openssl rand -base64 64
```

### 1.2 Frontend (`frontend/.env`)

```env
# Backend API URL — set to your Railway backend URL in production
# In development, Vite proxies /api to localhost:3001 automatically
VITE_API_URL=https://your-railway-app.up.railway.app/api
```

---

## 2. Database — SQLite with Railway Volume (Production)

The app uses SQLite locally via `data/app.db`. On Railway, the filesystem is **ephemeral** — any file written to disk is lost when the service restarts or redeploys. To keep your SQLite data persistent, you need a **Railway Volume**.

### 2.1 How It Works

- The Dockerfile creates `/app/data` for the database file
- A Railway Volume mounts a persistent disk at `/app/data`
- The app writes `app.db` inside that directory — it survives restarts and redeploys
- The Volume is bound to your Railway service and persists across deployments

### 2.2 Create a Volume in Railway

1. Go to your Railway project dashboard
2. Select your backend service
3. Go to the **Volumes** tab
4. Click **Add Volume**
5. Configure:

   | Setting | Value |
   |---|---|
   | **Mount path** | `/app/data` |
   | **Size** | 1 GB (free tier, more than enough for SQLite) |
   | **Name** | `pa-app-data` (or any descriptive name) |

6. Click **Add Volume**

Railway will restart your service with the volume attached. The app will now write `app.db` to persistent storage.

### 2.3 Verify the Volume Is Working

1. Open your Railway service logs
2. You should see: `[DB] Connecting to: file:/app/data/app.db`
3. Sign up and create some data in the app
4. Trigger a manual restart in Railway (click **Redeploy** or use the **Restart** button)
5. After restart, your data should still be there

### 2.4 Initializing the Database

You don't need to run any migration scripts. The app automatically creates all tables on startup via `initDB()` in `backend/src/db.ts`. Just deploy and the first request triggers table creation.

If you want to pre-seed data (e.g., achievements), the app also runs `seedAchievements()` on startup.

---

## 3. Backend — Railway Deployment

### 3.1 Railway Project Setup

1. Go to [railway.app](https://railway.app) → **Dashboard**
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your repository
4. Railway auto-detects `railway.json` and uses it to configure the build:
   - **Builder**: `DOCKERFILE`
   - **Dockerfile path**: `backend/Dockerfile`
   - **Build context**: `backend` (set in `railway.json` — COPY paths are relative to `backend/`)

5. No need to manually set a root directory — `railway.json` handles everything

### 3.2 Configure Environment Variables

In your Railway project dashboard → **Variables**, add:

| Variable | Value | Notes |
|---|---|---|
| `PORT` | `3001` | Must match what the app listens on |
| `JWT_SECRET` | *(secure random string)* | Same as local `.env` |
| `CORS_ORIGIN` | `https://your-vercel-app.vercel.app` | Your Vercel frontend URL |
| `DATABASE_URL` | `file:./data/app.db` | SQLite file — must match Volume mount path |
| `GOOGLE_CLIENT_ID` | *(optional)* | For Google OAuth |
| `GOOGLE_CLIENT_SECRET` | *(optional)* | For Google OAuth |

> **Important:** `DATABASE_URL` must be `file:./data/app.db` (relative to the working directory inside the container, which is `/app`). The Railway Volume mounts at `/app/data`, so the database file lives at `/app/data/app.db` — this path survives restarts.

### 3.3 Create the Volume

Follow the steps in [Section 2.2](#22-create-a-volume-in-railway) **before** deploying, or immediately after. The volume must be mounted at `/app/data` for the SQLite file to persist.

### 3.4 Auto-Deploy Setup

Railway auto-deploys your backend whenever you push to the connected branch (usually `main`). No token or CI/CD secret needed — it's built into Railway's free tier.

If you want to control which branch triggers deployment:
1. In your Railway service → **Settings** → **GitHub Repo**
2. Set **Branch** to `main` (or your preferred deployment branch)
3. Save — pushes to that branch will auto-deploy

### 3.5 Manual Backend Deploy (Optional)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project (from the backend directory)
cd backend
railway link

# Deploy
railway up

# View logs
railway logs
```

After deployment, verify your backend is live:

```bash
curl https://your-railway-app.up.railway.app/api/health
# → {"status":"ok","timestamp":"..."}
```

---

## 4. Frontend — Vercel Deployment

### 4.1 Import the Project

1. Go to [vercel.com](https://vercel.com) → **Add New Project** → **Import Git Repository**
2. Select your repository
3. Configure the project:

| Setting | Value |
|---|---|
| **Framework preset** | `Vite` |
| **Root directory** | `frontend` |
| **Build command** | `npm run build` |
| **Output directory** | `dist` |
| **Node.js version** | 20.x |

4. Click **Deploy**

### 4.2 Set Environment Variables

In Vercel project → **Settings → Environment Variables**, add:

| Variable | Value | Environment |
|---|---|---|
| `VITE_API_URL` | `https://your-railway-app.up.railway.app/api` | Production |

### 4.3 SPA Routing

Both `vercel.json` (repo root) and `frontend/vercel.json` include the same SPA rewrite rule:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

- **`vercel.json`** (root) — active when you set the root directory to the repo root in Vercel
- **`frontend/vercel.json`** — active when you set the root directory to `frontend` (as recommended in Section 4.1)

This ensures all paths (e.g., `/tasks`, `/habits`, `/settings`) serve `index.html` and let React Router handle the routing.

### 4.4 Auto-Deploy Setup

Vercel auto-deploys your frontend whenever you push to the connected branch. No token or CI/CD secret needed — it's built into Vercel's free tier.

By default, Vercel deploys:
- **Production** — pushes to `main` (or the default branch you selected)
- **Preview** — pushes to other branches (useful for testing PRs)

To change the production branch, go to Vercel project → **Settings → Git** → **Production Branch**.

### 4.5 Manual Frontend Deploy (Optional)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy to production
cd frontend
vercel --prod
```

---

## 5. Auto-Deploy (Free, No Tokens Needed)

Both Railway and Vercel provide **free auto-deploy** directly from your GitHub repository. No API tokens, no GitHub Actions secrets, no CI/CD setup required.

### 5.1 How Auto-Deploy Works

| Platform | Trigger | What Happens |
|---|---|---|
| **Railway** | Push to `main` | Backend auto-builds from `Dockerfile` and deploys |
| **Vercel** | Push to `main` | Frontend auto-builds and deploys to production |
| **Vercel** | Push to any branch | Frontend deploys a **preview** with a unique URL |

There's nothing extra to configure — once you connect your GitHub repo during project creation (as covered in Sections 3 and 4), auto-deploy is enabled by default.

### 5.2 GitHub Actions (Type-Check Only)

The `.github/workflows/deploy.yml` file runs **type-checking and build verification** on every push and every PR — no secrets needed:

| Event | What Runs |
|---|---|
| Push to any branch | TypeScript type-check + build (frontend + backend) |
| PR to `main` | TypeScript type-check + build (frontend + backend) |

This workflow does **not** deploy anything — it's a safety net to catch TypeScript errors before they reach production. Actual deployment is handled by Vercel and Railway's built-in auto-deploy from GitHub.

---

## 6. Google OAuth Setup (Production)

If you want Google Sign-In to work in production:

### 6.1 Create a Google OAuth Credential

1. Go to [console.cloud.google.com](https://console.cloud.google.com/apis/credentials)
2. Select or create a project
3. Go to **OAuth consent screen** → configure as **External** (or Internal if using Google Workspace)
4. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
5. Choose **Web application**
6. Add authorized JavaScript origins:
   - `https://your-vercel-app.vercel.app`
7. Add authorized redirect URIs:
   - `https://your-vercel-app.vercel.app` (if using client-side flow)
   - `https://your-railway-app.up.railway.app/api/auth/google/web` (if using server-side flow)

### 6.2 Set Environment Variables

**Backend (Railway):**
```
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**Frontend (Vercel):**
```
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

---

## 7. Post-Deployment Verification

### 7.1 Check Backend Health

```bash
curl https://your-railway-app.up.railway.app/api/health
```

Expected response:
```json
{ "status": "ok", "timestamp": "2025-01-01T00:00:00.000Z" }
```

### 7.2 Test Frontend

1. Visit `https://your-vercel-app.vercel.app`
2. Create a new account
3. Create a task, habit, or note
4. Refresh the page — data should persist

### 7.3 Monitor Logs

**Railway logs:**
```bash
railway logs
# or in the Railway dashboard → your service → Logs
```

**Vercel logs:**
Visit Vercel dashboard → your project → **Deployments** → deployment → **Functions** or **Logs**

---

## 8. Troubleshooting

### 8.1 CORS Errors (Browser)

If the frontend can't reach the backend:

1. Verify `CORS_ORIGIN` in Railway matches your Vercel URL exactly (no trailing slash)
2. Verify `VITE_API_URL` in Vercel points to the Railway backend URL
3. Check that the backend has `https://` not `http://` in the CORS origin

### 8.2 Database Reset (Data Disappears After Restart)

If your data disappears on Railway after a restart:

1. You likely forgot to create a **Railway Volume** — the service's filesystem is ephemeral
2. Go to your Railway service → **Volumes** tab → **Add Volume**
3. Set mount path to `/app/data` (this is where `data/app.db` resolves to inside the container)
4. After attaching the volume, redeploy the service
5. Data from future sessions will persist. Existing data that was in the ephemeral filesystem is already lost

### 8.3 Permission Issues on Volume

If the app can't write to the database file after adding a volume:

1. Check logs for `EACCES: permission denied` errors
2. This can happen if the volume's permissions don't match the `node` user in the container
3. The Dockerfile uses the default root user in the Alpine image, which should have write access
4. If issues persist, add a `RUN chown -R node:node /app/data` step to the Dockerfile

### 8.4 401 Unauthorized

If API requests return 401 after login:

1. Check `JWT_SECRET` is the same across all environments
2. If you changed the secret, all existing tokens are invalidated — users need to re-login
3. Ensure the token is being sent in the `Authorization: Bearer <token>` header

### 8.5 Auto-Deploy Not Triggering

**Railway not deploying:**
- Check Railway dashboard → your service → **Deployments** tab — did a deployment start?
- In Railway → your service → **Settings** → **GitHub Repo**, verify the correct branch is set
- Disconnect and reconnect the GitHub repo if needed

**Vercel not deploying:**
- Check Vercel dashboard → your project → **Deployments** — did a deployment start?
- In Vercel → **Settings** → **Git** → **Production Branch**, verify it's set to `main`
- Make sure the **Root Directory** in Vercel project settings is `frontend`
- Git push again — Vercel should pick it up

### 8.6 TypeScript Errors in CI

- The `test` job runs `tsc --noEmit` for both frontend and backend
- If CI fails on TS errors but works locally, check Node.js version mismatch (CI uses Node 20)
- Run `npm ci` (not `npm install`) to match CI behavior exactly

---

## 9. Environment Files Reference

| File | Purpose |
|---|---|
| `backend/.env` | Local backend environment variables |
| `backend/.env.example` | Template with documented variables |
| `frontend/.env` | Local frontend environment variables |
| `backend/Dockerfile` | Multi-stage Docker build — COPY paths relative to `backend/` context |
| `railway.json` | Railway project config — sets Docker builder, Dockerfile path, and build context |
| `vercel.json` | Root Vercel config — SPA rewrites for client-side routing |
| `.github/workflows/deploy.yml` | CI/CD type-check pipeline |

---

## 10. Docker Build (Alternative Deploy)

If you want to deploy the backend on a different Docker-compatible platform (Fly.io, Render, DigitalOcean App Platform, etc.):

```bash
# Build the image (context must be backend/)
docker build -t pa-app-backend -f backend/Dockerfile backend

# Run locally to test
docker run -p 3001:3001 \
  -e DATABASE_URL=file:./data/app.db \
  -e JWT_SECRET=your-secret \
  -e CORS_ORIGIN=http://localhost:5173 \
  pa-app-backend
```

> **Note:** The build context is `backend/` — COPY paths in the Dockerfile are relative to that directory. Railway handles this via the `context` setting in `railway.json`.

---

## 11. Rolling Back

### Vercel (Instant)

1. Go to Vercel dashboard → your project → **Deployments**
2. Find the last known-good deployment
3. Click the **•••** menu → **Promote to Production**

### Railway

```bash
# List deployments
railway deployment list

# Rollback to a specific deployment
railway deployment rollback <deployment-id>
```

Or in the Railway dashboard → your service → **Deployments** → select deployment → **Rollback to this deploy**.

> **Note:** Rolling back a Railway deployment does **not** affect your Volume data. The SQLite database file on the volume stays intact, so your data is preserved across rollbacks.
