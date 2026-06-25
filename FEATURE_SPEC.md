# PA App — Feature Specification

> Version 1.0.0 | Last Updated: 2026-06-25

## Overview

PA App is a full-stack personal productivity and life management application. It consolidates task management, habit tracking, goal setting, mood logging, journaling, finance tracking, and more into a single unified platform. This document specifies every feature for the **Frontend (Web)** and **Backend (API)** layers.

---

## 1. Authentication & User Management

### 1.1 Email/Password Authentication
- **Registration:** Users sign up with email, password, and display name. Passwords are hashed with bcryptjs before storage.
- **Login:** Returns a JWT token (7-day expiry) on valid credentials.
- **Protected Routes:** All non-auth API endpoints require a valid JWT in the `Authorization` header. The frontend wraps all app pages in a `ProtectedRoute` component that redirects unauthenticated users to `/login`.

### 1.2 Google OAuth
- **Web Flow:** Users click "Sign in with Google" → Google identity popup → backend verifies the Google ID token → issues a JWT.
- **Endpoints:** `POST /api/auth/google/web` for web clients.

### 1.3 User Profile
- View and update display name and email.
- Manage settings: theme preference (light/dark), accent color, PIN.

---

## 2. Dashboard

The landing page after login. Provides a daily snapshot of the user's life.

| Widget | Description |
|---|---|
| **Daily Agenda** | Tasks due today, grouped by priority |
| **Productivity Score** | Composite score based on task completions, habit streaks, and focus sessions |
| **Weekly Overview** | Bar chart of tasks completed per day over the past 7 days |
| **Weather Widget** | Current weather for the user's selected city (Open-Meteo API) |
| **Mood Check-In** | Quick 1–5 mood + energy rating with optional note |
| **Habit Tracker** | Today's habits with one-tap completion |
| **Focus Timer** | Pomodoro timer with task linking |
| **Ambient Sounds** | 8 nature/ambient sounds (rain, forest, café, etc.) for focus |
| **Quick Capture** | Global modal to jot down a thought or note instantly |

---

## 3. Task Management

### 3.1 Tasks
- **CRUD:** Create, read, update, delete tasks.
- **Fields:** Title, description, status (`todo` / `in_progress` / `done`), priority (`low` / `medium` / `high`), due date, category, recurrence (`daily` / `weekly` / `monthly`), recurrence end date, parent task (subtasks), linked goal.
- **Categories:** User-defined categories for organizing tasks.
- **Tags:** Many-to-many tagging system for flexible classification.

### 3.2 Kanban Board
- Three-column board (To Do, In Progress, Done).
- Visual task cards with priority color coding.
- Drag-and-drop status changes.

### 3.3 Calendar View
- Monthly calendar showing tasks plotted by due date.
- Click a day to see its tasks.

---

## 4. Habit Tracking

- **Create Habits:** Name, frequency (daily or specific days of the week), category (health, fitness, learning, mindfulness, productivity, general).
- **Daily Completion:** Tap to mark a habit done for today. Supports multiple completions per day.
- **Streak Tracking:** Current streak and best streak calculated from completion history.
- **Analytics:** Completion rate over time, streak history, category breakdown.
- **Dashboard Integration:** Today's habits appear on the dashboard with one-tap completion.

---

## 5. Goals

- **Create Goals:** Title, description, target date, status (`active` / `completed` / `abandoned`).
- **Progress Tracking:** Manual progress percentage (0–100%).
- **Linking:** Tasks and habits can be linked to a goal. Goal progress auto-calculates from linked item completion.
- **Stats:** View linked tasks/habits count, completion rates, and days remaining.

---

## 6. Focus Timer (Pomodoro)

- **Session Types:** 25-minute focus / 5-minute break (standard Pomodoro).
- **Task Linking:** Attach a focus session to a specific task.
- **History:** View past sessions with duration, task, and completion timestamp.
- **Dashboard Widget:** Start a focus session directly from the dashboard.

---

## 7. Mood Tracker

- **Daily Entry:** One mood entry per day with mood rating (1–5) and energy rating (1–5).
- **Notes:** Optional text note to capture context.
- **History:** View mood over time with trend visualization.

---

## 8. Journal

- **Entries:** Daily journal/reflection entries with optional title and mood tag.
- **Rich Text:** Plain text entries with timestamps.
- **List View:** Browse all entries chronologically.

---

## 9. Ideas Board

- **Sticky Notes:** Create idea cards with text content and color coding.
- **Position Tracking:** Cards maintain position on the board.
- **Quick Capture:** Ideas can be added from the global Quick Capture modal.

---

## 10. Reading List

- **Save URLs:** Add articles/URLs with title and URL.
- **Read Status:** Mark items as read/unread.
- **List View:** Filter by read/unread status.

---

## 11. Workout Tracking

- **Workout Sessions:** Create workouts with type, duration, and notes.
- **Exercise Sets:** Each workout contains multiple exercise sets with reps, weight, or duration.
- **History:** Browse past workouts chronologically.

---

## 12. Expense Tracking

- **Log Expenses:** Amount, category, description, date.
- **Categories:** User-defined expense categories.
- **Summary:** View expenses by category and time period.

---

## 13. Achievements (Gamification)

- **15 Badge Types:** Automatically awarded based on user activity:
  - Task completion milestones
  - Habit streak milestones
  - Focus session milestones
  - Goal completion
  - Journaling streaks
  - Reading list milestones
  - Workout milestones
  - Expense tracking milestones
  - Mood tracking streaks
- **Auto-Check:** Achievements are checked and awarded after each relevant action.
- **Display:** Achievement gallery on the user's profile.

---

## 14. Reminders

- **Recurring Reminders:** Set reminders with time and day-of-week configuration.
- **Notifications:** Display reminders on the dashboard.

---

## 15. Settings

- **Theme:** Light / Dark mode toggle.
- **Accent Color:** Choose from predefined accent colors.
- **PIN:** Optional numeric PIN for additional security.
- **City Selection:** Choose a city for the weather widget (25+ pre-configured cities).

---

## 16. News Feed

- **Headlines:** International news headlines fetched from external sources.
- **Read More:** Link through to full articles.

---

## Non-Functional Requirements

| Requirement | Specification |
|---|---|
| **Performance** | Frontend lazy-loads all routes; backend uses in-memory SQLite for fast queries |
| **Security** | JWT auth, bcrypt password hashing, Helmet HTTP headers, CORS, Zod input validation |
| **Accessibility** | Keyboard navigable, semantic HTML, ARIA labels on interactive elements |
| **Browser Support** | Modern evergreen browsers (Chrome, Firefox, Safari, Edge) |
| **API Response Format** | All endpoints return JSON with consistent `{ data, error }` shape |
