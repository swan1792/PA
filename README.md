# PA App — Personal Assistant App

A full-stack personal productivity and life management platform. Track your tasks, habits, goals, mood, workouts, expenses, journal, reading list, ideas, and more — all from a single app.

---

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite 5** (dev server + HMR)
- **Tailwind CSS 3** with Neobrutalism design system
- **Zustand** for state management
- **React Router 6** with lazy-loaded routes
- **Framer Motion** for animations
- **Axios** with JWT interceptor

### Backend
- **Node.js** with Express 4 and TypeScript
- **SQLite** via sql.js (in-memory with file persistence)
- **JWT** authentication (7-day expiry)
- **bcryptjs** for password hashing
- **Zod** for input validation
- **Helmet** + **CORS** for security

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd PA_App

# Install all dependencies (root, backend, frontend)
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### Environment Setup

1. Copy the example env file:
   ```bash
   cp backend/.env.example backend/.env
   ```

2. Edit `backend/.env` with your values:
   ```
   PORT=3001
   JWT_SECRET=your-secret-key
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

3. (Optional) Set the frontend Google client ID in `frontend/.env`:
   ```
   VITE_GOOGLE_CLIENT_ID=your-google-client-id
   ```

### Run the App

```bash
# Start backend + frontend concurrently
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001
- **Health Check:** http://localhost:3001/api/health

---

## Project Structure

```
PA_App/
├── frontend/                 # React web application
│   ├── src/
│   │   ├── api/              # Axios client with JWT interceptor
│   │   ├── components/       # Reusable UI, layout, and feature components
│   │   ├── pages/            # 16 page components
│   │   ├── store/            # 20 Zustand stores
│   │   ├── types/            # TypeScript interfaces
│   │   ├── App.tsx           # Router configuration
│   │   └── main.tsx          # Entry point
│   ├── vite.config.ts
│   └── tailwind.config.js    # Neobrutalism design tokens
│
├── backend/                  # Express API server
│   ├── src/
│   │   ├── models/           # 15 data model files
│   │   ├── routes/           # 21 route files
│   │   ├── middleware/       # Auth + error handling
│   │   ├── utils/            # Helpers (async handler, Google auth)
│   │   ├── db.ts             # SQLite init + 20 tables
│   │   └── index.ts          # Express entry point
│   ├── data/app.db           # SQLite database file
│   └── .env
│
└── package.json              # Root scripts (dev, build)
```

---

## Features

| Module | Description |
|---|---|
| **Dashboard** | Daily agenda, productivity score, weather, mood check-in, quick capture |
| **Tasks** | CRUD with status, priority, due dates, categories, recurrence, subtasks |
| **Kanban Board** | Three-column visual task board |
| **Calendar** | Monthly view with tasks by due date |
| **Habits** | Daily/weekly tracking with streaks and analytics |
| **Goals** | Goal setting with progress tracking and linked tasks/habits |
| **Focus Timer** | Pomodoro sessions with task linking |
| **Mood Tracker** | Daily mood + energy rating |
| **Journal** | Daily reflection entries |
| **Ideas Board** | Sticky-note style idea capture |
| **Reading List** | Article URL saving with read status |
| **Workouts** | Exercise logging with sets and reps |
| **Expenses** | Financial tracking by category |
| **Achievements** | 15 auto-awarded badges |
| **Reminders** | Recurring time-based reminders |
| **Settings** | Theme, accent color, PIN, city selection |

---

## API Endpoints

All endpoints are under `/api/`. Authentication required for all non-auth routes.

| Group | Endpoints |
|---|---|
| **Auth** | `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/google/web` |
| **Tasks** | `GET/POST /api/tasks`, `GET/PUT/DELETE /api/tasks/:id` |
| **Habits** | `GET/POST /api/habits`, `GET/PUT/DELETE /api/habits/:id`, `POST /api/habits/:id/complete` |
| **Goals** | `GET/POST /api/goals`, `GET/PUT/DELETE /api/goals/:id` |
| **Moods** | `GET/POST /api/moods`, `GET/PUT/DELETE /api/moods/:id` |
| **Focus** | `GET/POST /api/focus-sessions`, `GET/DELETE /api/focus-sessions/:id` |
| **Journals** | `GET/POST /api/journals`, `GET/PUT/DELETE /api/journals/:id` |
| **Ideas** | `GET/POST /api/ideas`, `GET/PUT/DELETE /api/ideas/:id` |
| **Reading** | `GET/POST /api/reading-list`, `GET/PUT/DELETE /api/reading-list/:id` |
| **Workouts** | `GET/POST /api/workouts`, `GET/PUT/DELETE /api/workouts/:id` |
| **Expenses** | `GET/POST /api/expenses`, `GET/PUT/DELETE /api/expenses/:id` |
| **Achievements** | `GET /api/achievements`, `GET /api/achievements/user` |
| **Reminders** | `GET/POST /api/reminders`, `GET/PUT/DELETE /api/reminders/:id` |
| **Settings** | `GET/PUT /api/settings` |
| **Weather** | `GET /api/weather?city=<city>` |
| **Health** | `GET /api/health` |

---

## Design

The app uses a **Neobrutalism** design system:

- 3px solid black borders
- Offset drop shadows
- Warm off-white background (`#fffef7`)
- Coral primary (`#ff6b6b`), teal secondary (`#4ecdc4`), yellow accent (`#ffe66d`)
- Dark mode with deep navy background (`#1a1a2e`)
- Fonts: Inter (body) + Space Grotesk (display)

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start backend + frontend concurrently |
| `npm run dev:backend` | Start backend only |
| `npm run dev:frontend` | Start frontend only |
| `npm run build` | Build frontend for production |

---

## License

MIT
