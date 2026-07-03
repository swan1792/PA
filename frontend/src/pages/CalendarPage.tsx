import { useEffect, useState } from 'react'
import { useTaskStore } from '../store/taskStore'
import { useHabitStore } from '../store/habitStore'
import { useMoodStore } from '../store/moodStore'
import Layout from '../components/layout/Layout'
import Card from '../components/ui/Card'
import { clsx } from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function CalendarPage() {
  const { tasks, fetchTasks } = useTaskStore()
  const { fetchHabits } = useHabitStore()
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
    medium: 'bg-amber-500',
    low: 'bg-emerald-500',
  }

  const priorityBg: Record<string, string> = {
    high: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    medium: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    low: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
  }

  const moodEmojis = ['', '😢', '😟', '😐', '🙂', '😄']
  const moodColors = ['', 'text-red-400', 'text-orange-400', 'text-yellow-400', 'text-lime-400', 'text-green-400']

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))
  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(today)
  }

  const selectedTasks = selectedDate ? getTasksForDate(selectedDate) : []
  const selectedMood = selectedDate ? getMoodForDate(selectedDate) : null

  // Get upcoming tasks (next 7 days)
  const upcomingTasks = tasks
    .filter((t) => {
      if (!t.dueDate || t.status === 'done') return false
      const dueDate = new Date(t.dueDate)
      const now = new Date()
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      return dueDate >= now && dueDate <= weekFromNow
    })
    .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))
    .slice(0, 5)

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Calendar</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">View your tasks and moods on a calendar</p>
          </div>
          <button
            onClick={goToToday}
            className="px-4 py-2 text-sm font-medium text-brand-600 bg-brand-50 rounded-lg hover:bg-brand-100 dark:bg-brand-900/20 dark:text-brand-400 dark:hover:bg-brand-900/30 transition-colors"
          >
            Today
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Calendar */}
          <div className="lg:col-span-3">
            <Card className="overflow-hidden">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-6 px-1">
                <button
                  onClick={prevMonth}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {MONTHS[month]} {year}
                </h2>
                <button
                  onClick={nextMonth}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS.map((d) => (
                  <div
                    key={d}
                    className={clsx(
                      'text-center text-xs font-semibold py-2',
                      d === 'Sun' || d === 'Sat'
                        ? 'text-red-400 dark:text-red-500'
                        : 'text-gray-500 dark:text-gray-400'
                    )}
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, i) => {
                  if (!day) return <div key={`empty-${i}`} className="min-h-[90px]" />
                  const dateStr = getDateStr(day)
                  const dayTasks = getTasksForDate(dateStr)
                  const mood = getMoodForDate(dateStr)
                  const isToday = dateStr === today
                  const isSelected = dateStr === selectedDate
                  const isWeekend = new Date(year, month, day).getDay() === 0 || new Date(year, month, day).getDay() === 6

                  return (
                    <motion.button
                      key={dateStr}
                      onClick={() => setSelectedDate(dateStr)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={clsx(
                        'relative flex flex-col items-start p-2 rounded-xl min-h-[90px] transition-all duration-200 border',
                        isToday && !isSelected && 'border-brand-300 dark:border-brand-700 bg-brand-50/50 dark:bg-brand-900/10',
                        isSelected && 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 shadow-md shadow-brand-100 dark:shadow-brand-900/20',
                        !isSelected && !isToday && 'border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50',
                        isWeekend && !isSelected && !isToday && 'bg-gray-50/50 dark:bg-gray-800/20'
                      )}
                    >
                      {/* Date Number */}
                      <div className="flex items-center justify-between w-full">
                        <span
                          className={clsx(
                            'text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full',
                            isToday
                              ? 'bg-brand-500 text-white'
                              : isSelected
                              ? 'text-brand-600 dark:text-brand-400'
                              : isWeekend
                              ? 'text-red-500 dark:text-red-400'
                              : 'text-gray-700 dark:text-gray-300'
                          )}
                        >
                          {day}
                        </span>
                        {mood && (
                          <span className={clsx('text-lg', moodColors[mood.mood])}>
                            {moodEmojis[mood.mood]}
                          </span>
                        )}
                      </div>

                      {/* Task Indicators */}
                      {dayTasks.length > 0 && (
                        <div className="mt-auto pt-2 w-full">
                          <div className="flex flex-wrap gap-1">
                            {dayTasks.slice(0, 3).map((t) => (
                              <div
                                key={t.id}
                                className={clsx(
                                  'h-1.5 rounded-full flex-1 min-w-[12px]',
                                  priorityColors[t.priority],
                                  t.status === 'done' && 'opacity-40'
                                )}
                              />
                            ))}
                            {dayTasks.length > 3 && (
                              <span className="text-[10px] text-gray-400 ml-1">
                                +{dayTasks.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </motion.button>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <span className="text-xs text-gray-500 dark:text-gray-400">Priority:</span>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">High</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Medium</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Low</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Selected Date Details */}
            <AnimatePresence mode="wait">
              {selectedDate ? (
                <motion.div
                  key={selectedDate}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </h3>
                      <button
                        onClick={() => setSelectedDate(null)}
                        className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {selectedTasks.length === 0 && !selectedMood && (
                      <div className="text-center py-6">
                        <span className="text-4xl">📭</span>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">No entries for this date</p>
                      </div>
                    )}

                    {selectedTasks.length > 0 && (
                      <div className="space-y-2 mb-4">
                        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Tasks ({selectedTasks.length})
                        </h4>
                        {selectedTasks.map((t) => (
                          <div
                            key={t.id}
                            className={clsx(
                              'flex items-center gap-3 p-2.5 rounded-lg border',
                              priorityBg[t.priority],
                              t.status === 'done' && 'opacity-60'
                            )}
                          >
                            <div className={clsx('w-2 h-2 rounded-full', priorityColors[t.priority])} />
                            <span
                              className={clsx(
                                'text-sm flex-1',
                                t.status === 'done' && 'line-through text-gray-400'
                              )}
                            >
                              {t.title}
                            </span>
                            {t.status === 'done' && (
                              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedMood && (
                      <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                          Mood & Energy
                        </h4>
                        <div className="flex items-center gap-4">
                          <span className="text-3xl">{moodEmojis[selectedMood.mood]}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs text-gray-500">Mood</span>
                              <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-red-400 to-green-400 rounded-full"
                                  style={{ width: `${(selectedMood.mood / 5) * 100}%` }}
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">Energy</span>
                              <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-blue-400 to-yellow-400 rounded-full"
                                  style={{ width: `${(selectedMood.energy / 5) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        {selectedMood.note && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            {selectedMood.note}
                          </p>
                        )}
                      </div>
                    )}
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Upcoming Tasks
                    </h3>
                    {upcomingTasks.length === 0 ? (
                      <div className="text-center py-6">
                        <span className="text-4xl">✨</span>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">No upcoming tasks</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {upcomingTasks.map((t) => (
                          <div
                            key={t.id}
                            className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            <div className={clsx('w-2 h-2 rounded-full', priorityColors[t.priority])} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                                {t.title}
                              </p>
                              <p className="text-xs text-gray-400">
                                {t.dueDate
                                  ? new Date(t.dueDate + 'T00:00:00').toLocaleDateString('en-US', {
                                      weekday: 'short',
                                      month: 'short',
                                      day: 'numeric',
                                    })
                                  : 'No due date'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Layout>
  )
}
