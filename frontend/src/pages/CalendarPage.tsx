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
        <div className="page-header">
          <div className="page-header-row">
            <div>
              <h1>Calendar</h1>
              <p>View your tasks and moods on a calendar</p>
            </div>
            <button
              onClick={goToToday}
              className="pill-inactive text-xs"
            >
              Today
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Calendar */}
          <div className="lg:col-span-3">
            <Card className="overflow-hidden">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-5 px-0.5">
                <button
                  onClick={prevMonth}
                  className="p-2 rounded-lg text-neo-textSecondary hover:text-neo-text hover:bg-gray-100 dark:hover:bg-[#2a2a40] transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <h2 className="text-base font-semibold text-neo-text">
                  {MONTHS[month]} {year}
                </h2>
                <button
                  onClick={nextMonth}
                  className="p-2 rounded-lg text-neo-textSecondary hover:text-neo-text hover:bg-gray-100 dark:hover:bg-[#2a2a40] transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-px mb-1">
                {DAYS.map((d) => (
                  <div
                    key={d}
                    className={clsx(
                      'text-center text-xs font-semibold py-2',
                      d === 'Sun' || d === 'Sat'
                        ? 'text-red-400 dark:text-red-500'
                        : 'text-neo-muted'
                    )}
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-px">
                {calendarDays.map((day, i) => {
                  if (!day) return <div key={`empty-${i}`} className="min-h-[80px]" />
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
                      whileTap={{ scale: 0.95 }}
                      className={clsx(
                        'relative flex flex-col items-start p-1.5 min-h-[80px] transition-all duration-150 rounded-lg',
                        isToday && !isSelected && 'bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-300 dark:ring-blue-700',
                        isSelected && 'bg-gray-100 dark:bg-[#2a2a40] ring-1 ring-gray-300 dark:ring-gray-600',
                        !isSelected && !isToday && 'hover:bg-gray-50 dark:hover:bg-[#252538]',
                        isWeekend && !isSelected && !isToday && 'bg-gray-50/50 dark:bg-gray-800/10'
                      )}
                    >
                      {/* Date Number */}
                      <span
                        className={clsx(
                          'text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full',
                          isToday
                            ? 'bg-neo-primary text-white'
                            : isSelected
                            ? 'text-neo-text'
                            : isWeekend
                            ? 'text-red-500 dark:text-red-400'
                            : 'text-neo-textSecondary'
                        )}
                      >
                        {day}
                      </span>

                      {/* Mood indicator */}
                      {mood && (
                        <span className={clsx('text-xs mt-0.5', moodColors[mood.mood])}>
                          {moodEmojis[mood.mood]}
                        </span>
                      )}

                      {/* Task dots */}
                      {dayTasks.length > 0 && (
                        <div className="mt-auto pt-1 w-full flex gap-0.5">
                          {dayTasks.slice(0, 3).map((t) => (
                            <div
                              key={t.id}
                              className={clsx(
                                'h-1 rounded-full flex-1 max-w-[14px]',
                                priorityColors[t.priority],
                                t.status === 'done' && 'opacity-40'
                              )}
                            />
                          ))}
                          {dayTasks.length > 3 && (
                            <span className="text-[9px] text-neo-muted ml-0.5">
                              +{dayTasks.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </motion.button>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-neo-border">
                <span className="text-xs text-neo-muted">Priority:</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="text-xs text-neo-textSecondary">High</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-xs text-neo-textSecondary">Medium</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs text-neo-textSecondary">Low</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
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
                      <h3 className="text-sm font-semibold text-neo-text">
                        {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </h3>
                      <button
                        onClick={() => setSelectedDate(null)}
                        className="p-1 rounded-lg text-neo-muted hover:text-neo-text hover:bg-gray-100 dark:hover:bg-[#2a2a40] transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {selectedTasks.length === 0 && !selectedMood && (
                      <div className="text-center py-8">
                        <span className="text-2xl">📭</span>
                        <p className="text-neo-textSecondary text-xs mt-2">No entries for this date</p>
                      </div>
                    )}

                    {selectedTasks.length > 0 && (
                      <div className="space-y-2 mb-4">
                        <h4 className="text-[11px] font-semibold text-neo-muted uppercase tracking-wider">
                          Tasks ({selectedTasks.length})
                        </h4>
                        {selectedTasks.map((t) => (
                          <div
                            key={t.id}
                            className={clsx(
                              'flex items-center gap-2.5 p-2.5 rounded-lg border',
                              priorityBg[t.priority],
                              t.status === 'done' && 'opacity-60'
                            )}
                          >
                            <div className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', priorityColors[t.priority])} />
                            <span
                              className={clsx(
                                'text-sm flex-1',
                                t.status === 'done' && 'line-through text-neo-muted'
                              )}
                            >
                              {t.title}
                            </span>
                            {t.status === 'done' && (
                              <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedMood && (
                      <div className="pt-4 border-t border-neo-border">
                        <h4 className="text-[11px] font-semibold text-neo-muted uppercase tracking-wider mb-3">
                          Mood & Energy
                        </h4>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{moodEmojis[selectedMood.mood]}</span>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-neo-textSecondary w-9">Mood</span>
                              <div className="flex-1 h-1.5 bg-gray-100 dark:bg-[#2a2a40] rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-red-400 to-green-400 rounded-full"
                                  style={{ width: `${(selectedMood.mood / 5) * 100}%` }}
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-neo-textSecondary w-9">Energy</span>
                              <div className="flex-1 h-1.5 bg-gray-100 dark:bg-[#2a2a40] rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-blue-400 to-yellow-400 rounded-full"
                                  style={{ width: `${(selectedMood.energy / 5) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        {selectedMood.note && (
                          <p className="text-sm text-neo-textSecondary mt-3 p-2.5 bg-gray-50 dark:bg-[#252538] rounded-lg">
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
                    <h3 className="text-sm font-semibold text-neo-text mb-4">
                      Upcoming Tasks
                    </h3>
                    {upcomingTasks.length === 0 ? (
                      <div className="text-center py-8">
                        <span className="text-2xl">✨</span>
                        <p className="text-neo-textSecondary text-xs mt-2">No upcoming tasks</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {upcomingTasks.map((t) => (
                          <div
                            key={t.id}
                            className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#252538] transition-colors"
                          >
                            <div className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', priorityColors[t.priority])} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-neo-text truncate">
                                {t.title}
                              </p>
                              <p className="text-xs text-neo-muted">
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
