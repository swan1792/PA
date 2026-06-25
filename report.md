# PA App — Project Report

> Version 1.0.0 | Date: 2026-06-25

---

## 1. Executive Summary

PA App is a full-stack personal productivity and life management platform. It provides users with a unified interface to manage tasks, habits, goals, mood, journaling, finances, workouts, reading lists, and more. The project is structured as a monorepo with a **React frontend** and a **Node.js/Express backend**, communicating over a RESTful JSON API.

The application is fully functional with 16 feature modules, dual authentication (email/password + Google OAuth), a gamified achievement system, and a cohesive Neobrutalism design language.

---

## 2. Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────┐
│              Frontend (React)                │
│  React 18 + TypeScript + Vite + Tailwind    │
│  Zustand (state) + React Router + Axios     │
│  Port: 5173                                  │
└──────────────────┬──────────────────────────┘
                   │ HTTP (JSON API)
                   │ /api/* proxied in dev
┌──────────────────▼──────────────────────────┐
│            Backend (Express)                 │
│  Node.js + Express 4 + TypeScript           │
│  JWT Auth + Zod Validation + Helmet         │
│  Port: 3001                                  │
├──────────────────────────────────────────────┤
│              SQLite (sql.js)                 │
│  In-memory with file persistence             │
│  20 tables, 21 route groups                  │
│  File: backend/data/app.db                   │
└─────────────────────────────────────────────┘
```

### 2.2 Frontend Architecture

| Aspect | Detail |
|---|---|
| **Framework** | React 18 with TypeScript |
| **Build Tool** | Vite 5 (dev server on :5173, proxies `/api` to :3001) |
| **Styling** | Tailwind CSS 3 with Neobrutalism design system |
| **State Management** | 20 Zustand stores (one per feature domain) |
| **Routing** | React Router 6 with lazy-loaded routes and protected route wrapper |
| **HTTP Client** | Axios with JWT interceptor (auto-attaches token from localStorage) |
| **Animations** | Framer Motion for page transitions and micro-interactions |

**Key directories:**
- `frontend/src/store/` — 20 Zustand stores (auth, tasks, habits, goals, moods, focus, journal, ideas, reading, workouts, expenses, achievements, reminders, settings, weather, sounds, news, categories, tags, ui)
- `frontend/src/pages/` — 16 page components (Dashboard, Tasks, Kanban, Calendar, Habits, Goals, Focus, Mood, Journal, Ideas, Reading, Workouts, Expenses, Achievements, Reminders, Settings)
- `frontend/src/components/` — Reusable UI components, layout shell, auth wrappers, and feature-specific widgets

### 2.3 Backend Architecture

| Aspect | Detail |
|---|---|
| **Runtime** | Node.js with TypeScript 5 |
| **Framework** | Express 4 |
| **Database** | SQLite via sql.js (JavaScript implementation, no native bindings) |
| **Authentication** | JWT (7-day expiry) with bcryptjs password hashing |
| **Validation** | Zod schemas on all endpoints |
| **Security** | Helmet HTTP headers, CORS middleware |
| **Persistence** | In-memory SQLite loaded on startup, written to disk after each mutation |

**Key directories:**
- `backend/src/models/` — 15 data model files defining database operations
- `backend/src/routes/` — 21 route files (auth, tasks, habits, notes, categories, goals, moods, focus-sessions, sounds, weather, journals, tags, ideas, reading-list, workouts, expenses, achievements, reminders, settings, users, health)
- `backend/src/middleware/` — JWT authentication middleware and global error handler
- `backend/src/db.ts` — Database initialization, table creation (20 tables), and migration logic

### 2.4 Database Schema

20 tables in SQLite:

| Table | Purpose |
|---|---|
| `users` | User accounts (email, password hash, display name) |
| `user_settings` | Per-user preferences (theme, accent color, PIN) |
| `tasks` | Task items with status, priority, due date, recurrence, goal link |
| `categories` | User-defined task categories |
| `tags` / `task_tags` | Many-to-many tagging system |
| `habits` | Habit definitions with frequency and category |
| `habit_completions` | Daily habit completion records |
| `goals` | Goals with progress, status, and target date |
| `moods` | Daily mood and energy entries |
| `focus_sessions` | Pomodoro session records |
| `journals` | Journal/reflection entries |
| `ideas` | Sticky-note idea cards with color and position |
| `reading_list` | Saved articles/URLs with read status |
| `workouts` / `workout_sets` | Workout sessions and individual exercise sets |
| `expenses` | Expense records with amount and category |
| `achievements` / `user_achievements` | Achievement definitions and user unlock records |
| `reminders` | Recurring reminder configurations |
| `notes` | General notes |

---

## 3. Feature Modules

### 3.1 Core Productivity
- **Tasks** — Full CRUD with status, priority, due dates, categories, tags, recurrence, subtasks, and goal linking
- **Kanban Board** — Visual three-column task board
- **Calendar** — Monthly view with tasks plotted by due date
- **Focus Timer** — Pomodoro sessions with task linking and history

### 3.2 Personal Tracking
- **Habits** — Daily/weekly habit tracking with streaks and analytics
- **Mood Tracker** — Daily mood + energy rating with notes
- **Journal** — Daily reflection entries
- **Goals** — Goal setting with progress tracking and linked items

### 3.3 Life Management
- **Workouts** — Exercise logging with sets, reps, and weight
- **Expenses** — Financial tracking by category
- **Reading List** — Article URL saving with read status
- **Ideas Board** — Visual sticky-note brainstorming

### 3.4 Engagement
- **Achievements** — 15 auto-awarded badges across all feature areas
- **Reminders** — Recurring time-based reminders
- **News Feed** — International headlines
- **Ambient Sounds** — 8 nature sounds for focus

### 3.5 Utility
- **Dashboard** — Central hub with daily agenda, productivity score, weather, and quick actions
- **Quick Capture** — Global modal for instant note/idea capture
- **Settings** — Theme, accent color, PIN, city selection

---

## 4. Security

| Layer | Measure |
|---|---|
| **Authentication** | Dual: email/password (bcryptjs hashed) + Google OAuth |
| **Token Management** | JWT with 7-day expiry; stored in localStorage (web) |
| **API Protection** | All non-auth endpoints guarded by `authenticate` middleware |
| **Input Validation** | Zod schemas validate all request bodies |
| **HTTP Security** | Helmet sets secure HTTP headers |
| **CORS** | Configured for allowed origins |
| **Frontend Protection** | `ProtectedRoute` component redirects unauthenticated users |

---

## 5. Design System

The application uses a **Neobrutalism** design language:

- **Borders:** 3px solid black on all interactive elements
- **Shadows:** Offset drop shadows (4px–6px) creating a raised, tactile feel
- **Colors:** Warm off-white background (`#fffef7`), coral primary (`#ff6b6b`), teal secondary (`#4ecdc4`), yellow accent (`#ffe66d`)
- **Dark Mode:** Deep navy background (`#1a1a2e`) with adjusted palette
- **Typography:** Inter (body) + Space Grotesk (display headings)
- **Animations:** Framer Motion for page transitions, hover states, and micro-interactions

---

## 6. Development Workflow

### 6.1 Setup
```bash
npm install          # Install root dependencies
npm run dev          # Starts backend (:3001) + frontend (:5173) concurrently
```

### 6.2 Scripts
| Command | Description |
|---|---|
| `npm run dev` | Run backend + frontend in parallel |
| `npm run dev:backend` | Run backend only |
| `npm run dev:frontend` | Run frontend only |
| `npm run build` | Build frontend for production |

### 6.3 Environment Variables
- `backend/.env` — `PORT`, `JWT_SECRET`, Google OAuth credentials
- `frontend/.env` — Google OAuth client ID

---

## 7. External Integrations

| Service | Usage |
|---|---|
| **Open-Meteo API** | Weather data for 25+ pre-configured cities |
| **Google OAuth** | Social login for web clients |
| **Pixabay CDN** | Ambient sound audio files |

---

## 8. Known Limitations

1. **SQLite via sql.js** — Uses a JavaScript SQLite implementation (no native bindings). Database is loaded entirely into memory and manually persisted to disk after mutations. Not suitable for high-concurrency write workloads.
2. **No real-time sync** — All data is fetched via REST polling; no WebSocket or SSE support.
3. **Single-user design** — No multi-user collaboration or sharing features.
4. **Hardcoded city list** — Weather widget uses a static list of 25+ cities; no free-text city search.
5. **No automated tests** — No test suite currently exists for either frontend or backend.

---

## 9. Future Considerations

- Add automated testing (unit, integration, E2E)
- Migrate to a production-grade database (PostgreSQL) for scalability
- Add WebSocket support for real-time updates
- Implement data export/import functionality
- Add multi-user collaboration features
- Deploy with Docker containerization
