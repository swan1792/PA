import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import ProtectedRoute from './components/auth/ProtectedRoute'

const HomePage = lazy(() => import('./pages/HomePage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const TasksPage = lazy(() => import('./pages/TasksPage'))
const CalendarPage = lazy(() => import('./pages/CalendarPage'))
const KanbanPage = lazy(() => import('./pages/KanbanPage'))
const GoalsPage = lazy(() => import('./pages/GoalsPage'))
const NewsPage = lazy(() => import('./pages/NewsPage'))
const JournalPage = lazy(() => import('./pages/JournalPage'))
const IdeasPage = lazy(() => import('./pages/IdeasPage'))
const ReadingListPage = lazy(() => import('./pages/ReadingListPage'))
const WorkoutPage = lazy(() => import('./pages/WorkoutPage'))
const ExpensePage = lazy(() => import('./pages/ExpensePage'))
const AchievementsPage = lazy(() => import('./pages/AchievementsPage'))
const RemindersPage = lazy(() => import('./pages/RemindersPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))

function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
    </div>
  )
}

const Protected = ({ children }: { children: React.ReactNode }) => <ProtectedRoute>{children}</ProtectedRoute>

export default function App() {
  return (
    <Router>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<Protected><DashboardPage /></Protected>} />
          <Route path="/tasks" element={<Protected><TasksPage /></Protected>} />
          <Route path="/calendar" element={<Protected><CalendarPage /></Protected>} />
          <Route path="/kanban" element={<Protected><KanbanPage /></Protected>} />
          <Route path="/goals" element={<Protected><GoalsPage /></Protected>} />
          <Route path="/news" element={<Protected><NewsPage /></Protected>} />
          <Route path="/journal" element={<Protected><JournalPage /></Protected>} />
          <Route path="/ideas" element={<Protected><IdeasPage /></Protected>} />
          <Route path="/reading" element={<Protected><ReadingListPage /></Protected>} />
          <Route path="/workouts" element={<Protected><WorkoutPage /></Protected>} />
          <Route path="/expenses" element={<Protected><ExpensePage /></Protected>} />
          <Route path="/achievements" element={<Protected><AchievementsPage /></Protected>} />
          <Route path="/reminders" element={<Protected><RemindersPage /></Protected>} />
          <Route path="/settings" element={<Protected><SettingsPage /></Protected>} />
        </Routes>
      </Suspense>
    </Router>
  )
}
