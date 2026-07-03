---
marp: true
theme: default
paginate: true
size: 16:9
style: |
  section {
    font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
    background: #ffffff;
    color: #1a1a2e;
    padding: 40px 60px;
  }
  section.lead {
    background: linear-gradient(135deg, #1a1a2e, #16213e);
    color: #ffffff;
    text-align: center;
  }
  section.lead h1 {
    color: #ef4444;
    font-size: 2.5em;
  }
  section.lead h2 {
    color: #ffffff;
    font-weight: 300;
  }
  h1 {
    color: #1a1a2e;
    border-bottom: 3px solid #ef4444;
    padding-bottom: 10px;
  }
  h2 {
    color: #16213e;
  }
  strong {
    color: #ef4444;
  }
  ul {
    line-height: 1.6;
  }
  blockquote {
    border-left: 4px solid #ef4444;
    padding-left: 20px;
    font-style: italic;
    color: #555;
  }
  table {
    width: 100%;
    border-collapse: collapse;
  }
  th {
    background: #1a1a2e;
    color: white;
    padding: 10px;
  }
  td {
    padding: 10px;
    border-bottom: 1px solid #ddd;
  }
  section.title {
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
---

<!-- _class: lead title -->

# 🚀 PA App

### Your Personal Assistant — One App for Everything

**Live Demo:** pa-app.vercel.app

**Source Code:** github.com/mg-mg-swan/PA

---

## 🎯 What is PA App?

A **full-stack productivity platform** that consolidates task management, habit tracking, goal setting, journaling, finance tracking, and more into a single unified experience.

### Core Features

- **📋 Tasks** — Kanban board with drag-and-drop
- **📅 Calendar** — Visual task scheduling
- **🎯 Goals** — Track progress with milestones
- **💰 Expenses** — Financial tracking and insights
- **📓 Journal** — Daily reflections and mood tracking
- **⚙️ Settings** — Theme, accent colors, data export

> One app, one login, everything connected.

---

## 🛠️ Tech Stack

### Frontend
- **React 18** — Modern UI library
- **TypeScript** — Type-safe development
- **Vite** — Lightning-fast build tool
- **React Router v6** — Client-side routing
- **Tailwind CSS** — Utility-first styling
- **Zustand** — Lightweight state management
- **Framer Motion** — Beautiful animations

### Backend
- **Express.js** — REST API server
- **SQLite** — File-based database
- **JWT** — Secure authentication
- **Zod** — Schema validation

### Deployment
- **Vercel** — Serverless frontend
- **Railway** — Backend hosting

---

## 🏗️ Architecture

### Application Structure

```
pa-app/
├── frontend/              # React + TypeScript
│   ├── src/
│   │   ├── pages/         # 16 page components
│   │   ├── store/         # Zustand state stores
│   │   ├── components/    # Reusable UI components
│   │   └── api/           # API client layer
│   └── dist/              # Production build
├── backend/               # Express API
│   ├── src/
│   │   ├── routes/        # 15 API route modules
│   │   ├── models/        # Database models
│   │   └── middleware/    # Auth & error handling
│   └── data/              # SQLite database
└── package.json           # Monorepo scripts
```

---

## 🔐 Authentication Flow

### User Journey

1. **Register** → Name + email + password
2. **Login** → Email + password → JWT token
3. **Session** → Token stored in localStorage
4. **Protected Routes** — Auth guard on all features

### Security Features

- **JWT Tokens** — 7-day expiration
- **Password Hashing** — bcrypt with salt rounds
- **Input Validation** — Zod schemas on client & server
- **CORS Protection** — Configured origins

---

## 📊 Database Schema

### 20+ Tables

| Table | Purpose |
|-------|---------|
| **users** | User accounts |
| **tasks** | Task management with status/priority |
| **habits** | Habit tracking with streaks |
| **goals** | Goal setting with progress |
| **journals** | Daily journal entries |
| **moods** | Mood & energy tracking |
| **expenses** | Financial tracking |
| **focus_sessions** | Pomodoro timer |
| **ideas** | Idea board |
| **reading_list** | Reading tracker |
| **workouts** | Exercise logging |

---

## 🎨 User Interface

### Design Principles

- **Neobrutalism** — Bold borders, shadows, vibrant colors
- **Responsive** — Works on all screen sizes
- **Dark Mode** — System/light/dark theme support
- **Accessible** — Keyboard navigation support

### Key Pages

| Page | Description |
|------|-------------|
| **Dashboard** | Weather, calendar, tasks, quick notes |
| **Tasks** | List view with filters (todo/in-progress/done) |
| **Kanban** | Drag-and-drop board |
| **Calendar** | Monthly view with task dots |
| **Goals** | Progress tracking with status filters |
| **Expenses** | Monthly spending by category |
| **Settings** | Theme, accent colors, data export |

---

<!-- _class: lead -->

# 📸 Live Demo

## Screenshots

---

## 🏠 Homepage

Clean landing page with "Get Started" and "Learn More" CTAs

![center](../screenshots/01-home.png)

---

## 🔐 Login Page

Neobrutalism design with Google OAuth + email/password

![center](../screenshots/02-login.png)

---

## 📊 Dashboard

Weather widget, weekly calendar, tasks due today, quick notes

![bg fit right](../screenshots/03-dashboard.png)

---

## 📋 Tasks

Manage tasks with status filters: All / Todo / In Progress / Done

![center](../screenshots/04-tasks.png)

---

## 📌 Kanban Board

Drag-and-drop columns: To Do → In Progress → Done

![center](../screenshots/05-kanban.png)

---

## 📅 Calendar

Monthly view with today highlighted and upcoming tasks sidebar

![center](../screenshots/06-calendar.png)

---

## 📓 Journal

Write daily reflections with mood tracking

![center](../screenshots/07-journal.png)

---

## 🎯 Goals

Set goals and track progress: Active / Completed / Abandoned

![center](../screenshots/08-goals.png)

---

## 💰 Expenses

Track spending with monthly totals and category breakdown

![center](../screenshots/09-expenses.png)

---

## ⚙️ Settings

Theme (System/Light/Dark), accent colors, data export

![bg fit right](../screenshots/10-settings.png)

---

## 🚀 Deployment

### Vercel Configuration

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

### Deployment Steps

1. **Push to GitHub** — Version control
2. **Connect Vercel** — Auto-deploy on push
3. **Environment Variables** — JWT secret, DB path
4. **Custom Domain** — pa-app.vercel.app

---

## 🔮 Future Enhancements

### Short Term (v1.1)
- [ ] File upload for attachments
- [ ] Email notifications
- [ ] Mobile responsive improvements

### Medium Term (v2.0)
- [ ] Real-time sync
- [ ] Calendar integrations (Google Calendar)
- [ ] Mobile app (React Native)

### Long Term (v3.0)
- [ ] AI-powered insights
- [ ] Multi-language support
- [ ] Team collaboration features

---

## 💡 Key Learnings

### Technical
- **React 18** — Hooks, lazy loading, Suspense
- **Zustand** — Lightweight state management
- **TypeScript** — Type safety across stack
- **Neobrutalism** — Bold UI design system

### Development
- **Monorepo** — Shared scripts, unified build
- **Component Architecture** — 15+ reusable components
- **API Design** — RESTful with proper error handling
- **Auth Best Practices** — JWT + bcrypt + validation

---

## 📈 Project Metrics

### Development Stats

| Metric | Value |
|--------|-------|
| **Pages** | 16 |
| **API Routes** | 15+ |
| **Database Tables** | 20+ |
| **Components** | 15+ |
| **State Stores** | 15 |

### Code Quality
- TypeScript strict mode
- ESLint + Prettier
- Zod validation schemas
- Component-based architecture

---

<!-- _class: lead -->

# 🙏 Thank You!

## Questions?

**Demo:** pa-app.vercel.app

**Code:** github.com/mg-mg-swan/PA

**Contact:** mg-mg-swan

---

<!-- _class: lead -->

# 🚀 PA App

### Your Personal Assistant — One App for Everything

**Built with ❤️ by mg-mg-swan**
