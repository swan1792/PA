import { useEffect } from 'react'
import { useTaskStore } from '../../store/taskStore'
import { useHabitStore } from '../../store/habitStore'
import { useFocusStore } from '../../store/focusStore'
import Card from '../ui/Card'

export default function ProductivityScore() {
  const { tasks, fetchTasks } = useTaskStore()
  const { habits, fetchHabits } = useHabitStore()
  const { stats, fetchStats } = useFocusStore()

  useEffect(() => {
    fetchTasks()
    fetchHabits()
    fetchStats()
  }, [])

  // Calculate task score (40%)
  const today = new Date().toISOString().split('T')[0]
  const todayTasks = tasks.filter((t) => t.dueDate === today || (t.dueDate && t.dueDate < today))
  const doneTasks = todayTasks.filter((t) => t.status === 'done')
  const taskScore = todayTasks.length > 0 ? (doneTasks.length / todayTasks.length) * 100 : 100

  // Calculate habit score (40%)
  const todayHabits = habits.length
  const completedHabits = habits.filter((h) => h.completions.includes(today)).length
  const habitScore = todayHabits > 0 ? (completedHabits / todayHabits) * 100 : 100

  // Calculate focus score (20%)
  const focusGoal = 4 // 4 sessions = 100%
  const focusScore = Math.min((stats.today.sessions / focusGoal) * 100, 100)

  // Weighted total
  const totalScore = Math.round(taskScore * 0.4 + habitScore * 0.4 + focusScore * 0.2)
  const circumference = 2 * Math.PI * 60
  const offset = circumference - (totalScore / 100) * circumference

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-yellow-500'
    if (score >= 40) return 'text-orange-500'
    return 'text-red-500'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Outstanding!'
    if (score >= 75) return 'Great work!'
    if (score >= 60) return 'Good progress'
    if (score >= 40) return 'Keep going'
    return 'Room to grow'
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📊 Productivity Score</h3>

      <div className="flex justify-center mb-4">
        <div className="relative w-36 h-36">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r="60" fill="none" strokeWidth="10" className="stroke-gray-200 dark:stroke-gray-700" />
            <circle
              cx="70" cy="70" r="60" fill="none" strokeWidth="10"
              className={`${getScoreColor(totalScore)} transition-all duration-1000`}
              stroke="currentColor"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold ${getScoreColor(totalScore)}`}>{totalScore}</span>
            <span className="text-xs text-gray-500">/100</span>
          </div>
        </div>
      </div>

      <p className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">
        {getScoreLabel(totalScore)}
      </p>

      {/* Breakdown */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Tasks</span>
          <div className="flex items-center gap-2">
            <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${taskScore}%` }} />
            </div>
            <span className="text-xs font-medium w-8 text-right">{Math.round(taskScore)}%</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Habits</span>
          <div className="flex items-center gap-2">
            <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: `${habitScore}%` }} />
            </div>
            <span className="text-xs font-medium w-8 text-right">{Math.round(habitScore)}%</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Focus</span>
          <div className="flex items-center gap-2">
            <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: `${focusScore}%` }} />
            </div>
            <span className="text-xs font-medium w-8 text-right">{Math.round(focusScore)}%</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
