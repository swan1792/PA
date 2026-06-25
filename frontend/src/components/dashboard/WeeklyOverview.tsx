import { useEffect, useMemo } from 'react'
import { useTaskStore } from '../../store/taskStore'
import { useHabitStore } from '../../store/habitStore'
import { useMoodStore } from '../../store/moodStore'
import Card from '../ui/Card'
import { clsx } from 'clsx'

export default function WeeklyOverview() {
  const { tasks, fetchTasks } = useTaskStore()
  const { habits, fetchHabits } = useHabitStore()
  const { moods, fetchMoods } = useMoodStore()

  useEffect(() => {
    fetchTasks()
    fetchHabits()
    const today = new Date()
    const weekAgo = new Date(today)
    weekAgo.setDate(today.getDate() - 6)
    fetchMoods(weekAgo.toISOString().split('T')[0], today.toISOString().split('T')[0])
  }, [])

  const weekData = useMemo(() => {
    const days: { date: string; label: string; isToday: boolean; tasksDone: number; habitsDone: number; mood?: number }[] = []
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const today = new Date()

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const tasksDone = tasks.filter((t) => t.dueDate === dateStr && t.status === 'done').length
      const habitsDone = habits.filter((h) => h.completions.includes(dateStr)).length
      const mood = moods.find((m) => m.date === dateStr)

      days.push({
        date: dateStr,
        label: dayLabels[d.getDay()],
        isToday: i === 0,
        tasksDone,
        habitsDone,
        mood: mood?.mood,
      })
    }
    return days
  }, [tasks, habits, moods])

  const maxTasks = Math.max(...weekData.map((d) => d.tasksDone), 1)
  const maxHabits = Math.max(...weekData.map((d) => d.habitsDone), 1)
  const moodEmojis = ['', '😢', '😟', '😐', '🙂', '😄']

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📅 This Week</h3>

      <div className="grid grid-cols-7 gap-2">
        {weekData.map((day) => (
          <div
            key={day.date}
            className={clsx(
              'flex flex-col items-center gap-1 p-2 rounded-lg transition-colors',
              day.isToday && 'bg-brand-50 dark:bg-brand-900/20 ring-1 ring-brand-300'
            )}
          >
            <span className={clsx('text-xs font-medium', day.isToday ? 'text-brand-600' : 'text-gray-500')}>
              {day.label}
            </span>
            <span className="text-xs text-gray-400">{day.date.split('-')[2]}</span>

            {/* Task bar */}
            <div className="w-full flex justify-center">
              <div
                className="w-4 rounded-full bg-blue-500 transition-all"
                style={{ height: `${Math.max((day.tasksDone / maxTasks) * 32, day.tasksDone > 0 ? 4 : 0)}px` }}
                title={`${day.tasksDone} tasks`}
              />
            </div>

            {/* Habit bar */}
            <div className="w-full flex justify-center">
              <div
                className="w-4 rounded-full bg-purple-500 transition-all"
                style={{ height: `${Math.max((day.habitsDone / maxHabits) * 32, day.habitsDone > 0 ? 4 : 0)}px` }}
                title={`${day.habitsDone} habits`}
              />
            </div>

            {/* Mood */}
            {day.mood ? (
              <span className="text-sm">{moodEmojis[day.mood]}</span>
            ) : (
              <span className="text-sm text-gray-300 dark:text-gray-600">·</span>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span>Tasks</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-purple-500" />
          <span>Habits</span>
        </div>
        <div className="flex items-center gap-1">
          <span>😊</span>
          <span>Mood</span>
        </div>
      </div>
    </Card>
  )
}
