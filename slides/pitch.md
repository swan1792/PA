---
marp: true
auto-advance: 20
---

# PA App
## Your Personal Assistant — One App for Everything

*A full-stack productivity platform that consolidates task management, habit tracking, goal setting, journaling, finance tracking, and more into a single unified experience.*

**Tech Stack:** React · TypeScript · Express · SQLite · Tailwind CSS

---

## The Problem

### Managing your life requires too many apps

- **Tasks** in one app, **habits** in another, **journal** somewhere else
- Context switching kills productivity
- No single place to see your day at a glance
- Data is siloed — you can't see how your habits affect your goals

---

## The Solution

### PA App — Your Second Brain

One app. One login. Everything connected.

- Daily dashboard with your complete life snapshot
- 16 integrated modules: Tasks, Habits, Goals, Mood, Journal, Workouts, Expenses, Reading, Ideas
- Cross-module insights: link tasks to goals, track mood alongside productivity
- Beautiful Neobrutalism design with dark mode

---

## Key Features

### 16 Integrated Modules

| Productivity | Personal Tracking | Life Management |
|---|---|---|
| Tasks + Kanban Board | Habit Tracking + Streaks | Workout Logging |
| Calendar View | Mood Tracker | Expense Tracking |
| Focus Timer (Pomodoro) | Journal | Reading List |
| Goals + Progress | Achievements (15 badges) | Ideas Board |

Plus: Dashboard, Reminders, Weather, Ambient Sounds, Quick Capture, Settings

---

## Architecture

```
┌──────────────────────────────┐
│     Frontend (React Web)     │
│  React + TypeScript + Vite   │
│  Tailwind CSS + Zustand      │
│  Port: 5173                  │
└──────────────┬───────────────┘
               │  REST API (JSON)
┌──────────────▼───────────────┐
│    Backend (Express API)     │
│  Node.js + Express + TS      │
│  JWT Auth + Zod Validation   │
│  Port: 3001                  │
├──────────────────────────────┤
│     SQLite Database          │
│  20 tables, file-persisted   │
└──────────────────────────────┘
```

---

## Thank You

# PA App — Your Personal Assistant

*One app to manage your entire life.*

**Tech:** React · TypeScript · Express · SQLite · Tailwind CSS
**License:** MIT