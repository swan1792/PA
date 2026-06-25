import { useEffect, useState } from 'react'
import { useTaskStore } from '../store/taskStore'
import { useHabitStore } from '../store/habitStore'
import { useMoodStore } from '../store/moodStore'
import Layout from '../components/layout/Layout'
import Card from '../components/ui/Card'
import { clsx } from 'clsx'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function CalendarPage() {
  const { tasks, fetchTasks } = useTaskStore()
  const { habits, fetchHabits } = useHabitStore()
  const { moods, fetchMoods } = useMoodStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  useEffect(() => {
    fetchTasks()
    fetchHabits()
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    fetchMoods(start.toISOString().split('T')[0], end.toISOString().split('T')[0])
  }, [currentDate])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date().toISOString().split('T')[0]

  const calendarDays: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) calendarDays.push(null)
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i)

  const getDateStr = (day: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  const getTasksForDate = (dateStr: string) => tasks.filter((t) => t.dueDate === dateStr)
  const getMoodForDate = (dateStr: string) => moods.find((m) => m.date === dateStr)

  const priorityColors: Record<string, string> = {
    high: 'bg-red-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500',
  }

  const moodEmojis = ['', '😢', '😟', '😐', '🙂', '😄']

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const selectedTasks = selectedDate ? getTasksForDate(selectedDate) : []
  const selectedMood = selectedDate ? getMoodForDate(selectedDate) : null

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Calendar</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">View your tasks and moods on a calendar</p>
        </div>

        <Card>
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {MONTHS[month]} {year}
            </h2>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} />
              const dateStr = getDateStr(day)
              const dayTasks = getTasksForDate(dateStr)
              const mood = getMoodForDate(dateStr)
              const isToday = dateStr === today
              const isSelected = dateStr === selectedDate

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={clsx(
                    'relative flex flex-col items-center p-2 rounded-lg min-h-[70px] transition-all',
                    isToday && 'ring-2 ring-brand-500',
                    isSelected && 'bg-brand-50 dark:bg-brand-900/20',
                    !isSelected && 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  )}
                >
                  <span className={clsx('text-sm font-medium', isToday ? 'text-brand-600' : 'text-gray-700 dark:text-gray-300')}>
                    {day}
                  </span>
                  <div className="flex gap-0.5 mt-1">
                    {dayTasks.slice(0, 3).map((t) => (
                      <div key={t.id} className={clsx('w-1.5 h-1.5 rounded-full', priorityColors[t.priority])} />
                    ))}
                  </div>
                  {mood && <span className="text-xs mt-0.5">{moodEmojis[mood.mood]}</span>}
                </button>
              )
            })}
          </div>
        </Card>

        {/* Selected Date Details */}
        {selectedDate && (
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h3>
            {selectedTasks.length === 0 && !selectedMood && (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No entries for this date</p>
            )}
            {selectedTasks.length > 0 && (
              <div className="space-y-2 mb-4">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Tasks</h4>
                {selectedTasks.map((t) => (
                  <div key={t.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div className={clsx('w-2 h-2 rounded-full', priorityColors[t.priority])} />
                    <span className={clsx('text-sm', t.status === 'done' && 'line-through text-gray-400')}>{t.title}</span>
                    <span className="text-xs text-gray-400 ml-auto">{t.status.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            )}
            {selectedMood && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Mood & Energy</h4>
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{moodEmojis[selectedMood.mood]}</span>
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">Mood: {selectedMood.mood}/5</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">Energy: {selectedMood.energy}/5</p>
                  </div>
                </div>
                {selectedMood.note && <p className="text-sm text-gray-500 mt-2">{selectedMood.note}</p>}
              </div>
            )}
          </Card>
        )}
      </div>
    </Layout>
  )
}
