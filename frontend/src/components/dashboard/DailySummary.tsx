import { useEffect } from 'react'
import { useTaskStore } from '../../store/taskStore'
import { useHabitStore } from '../../store/habitStore'
import { useFocusStore } from '../../store/focusStore'
import Card from '../ui/Card'

const MOTIVATIONAL_QUOTES = [
  "The secret of getting ahead is getting started.",
  "Small daily improvements are the key to staggering long-term results.",
  "Focus on progress, not perfection.",
  "Every accomplishment starts with the decision to try.",
  "Your future is created by what you do today.",
  "Don't watch the clock; do what it does. Keep going.",
  "Success is the sum of small efforts repeated day in and day out.",
]

export default function DailySummary() {
  const { tasks, fetchTasks } = useTaskStore()
  const { habits, fetchHabits } = useHabitStore()
  const { stats, fetchStats } = useFocusStore()

  useEffect(() => {
    fetchTasks()
    fetchHabits()
    fetchStats()
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const quote = MOTIVATIONAL_QUOTES[new Date().getDay()]

  // Tasks
  const todayTasks = tasks.filter((t) => t.dueDate === today || (t.dueDate && t.dueDate < today))
  const doneTasks = todayTasks.filter((t) => t.status === 'done')

  // Habits
  const completedHabits = habits.filter((h) => h.completions.includes(today)).length
  const totalHabits = habits.length

  // Streaks
  const bestStreak = habits.reduce((max, h) => {
    const streak = calcStreak(h.completions, h.frequency, h.specificDays)
    return Math.max(max, streak)
  }, 0)

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">📋 Daily Summary</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 italic mb-4">"{quote}"</p>

      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
          <p className="text-2xl font-bold text-blue-600">{doneTasks.length}/{todayTasks.length}</p>
          <p className="text-xs text-gray-500">Tasks Done</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
          <p className="text-2xl font-bold text-purple-600">{completedHabits}/{totalHabits}</p>
          <p className="text-xs text-gray-500">Habits Done</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
          <p className="text-2xl font-bold text-green-600">{stats.today.sessions}</p>
          <p className="text-xs text-gray-500">Focus Sessions</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20">
          <p className="text-2xl font-bold text-orange-600">🔥 {bestStreak}</p>
          <p className="text-xs text-gray-500">Best Streak</p>
        </div>
      </div>
    </Card>
  )
}

function calcStreak(completions: string[], frequency: string, specificDays?: string[] | null): number {
  if (completions.length === 0) return 0
  const sorted = [...completions].sort().reverse()
  const today = new Date().toISOString().split('T')[0]
  const completionSet = new Set(sorted)
  let streak = 0
  const d = new Date(today)
  const dayLabels = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

  for (let i = 0; i < 365; i++) {
    const dateStr = d.toISOString().split('T')[0]
    const dayName = dayLabels[d.getDay()]
    if (frequency === 'specific' && specificDays && !specificDays.includes(dayName)) {
      d.setDate(d.getDate() - 1)
      continue
    }
    if (completionSet.has(dateStr)) {
      streak++
      d.setDate(d.getDate() - 1)
    } else {
      if (i === 0 && dateStr === today) { d.setDate(d.getDate() - 1); continue }
      break
    }
  }
  return streak
}
