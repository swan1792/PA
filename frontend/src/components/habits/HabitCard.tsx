import { clsx } from 'clsx'
import type { Habit } from '../../types'
import Card from '../ui/Card'

interface HabitCardProps {
  habit: Habit
  onToggle: (habitId: string, date: string) => void
  onDelete: (id: string) => void
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getWeekDates(): { date: string; label: string; isToday: boolean }[] {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const dates: { date: string; label: string; isToday: boolean }[] = []

  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - dayOfWeek + i)
    dates.push({
      date: d.toISOString().split('T')[0],
      label: DAY_LABELS[i],
      isToday: i === dayOfWeek,
    })
  }
  return dates
}

function calcStreak(completions: string[], frequency: string, specificDays?: string[] | null): number {
  if (completions.length === 0) return 0

  const sorted = [...completions].sort().reverse()
  const today = new Date().toISOString().split('T')[0]
  const completionSet = new Set(sorted)

  let streak = 0
  const d = new Date(today)

  // Start from today, walk backwards
  for (let i = 0; i < 365; i++) {
    const dateStr = d.toISOString().split('T')[0]
    const dayName = DAY_LABELS[d.getDay()].toLowerCase()

    // For 'specific' frequency, skip days that aren't scheduled
    if (frequency === 'specific' && specificDays && !specificDays.includes(dayName)) {
      d.setDate(d.getDate() - 1)
      continue
    }

    if (completionSet.has(dateStr)) {
      streak++
      d.setDate(d.getDate() - 1)
    } else {
      // Allow today to be incomplete (streak still counts if previous days are complete)
      if (i === 0 && dateStr === today) {
        d.setDate(d.getDate() - 1)
        continue
      }
      break
    }
  }

  return streak
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  health: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300' },
  fitness: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300' },
  learning: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300' },
  mindfulness: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300' },
  productivity: { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-300' },
  general: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-600 dark:text-gray-400' },
}

export default function HabitCard({ habit, onToggle, onDelete }: HabitCardProps) {
  const weekDates = getWeekDates()
  const streak = calcStreak(habit.completions, habit.frequency, habit.specificDays)
  const completionSet = new Set(habit.completions)
  const catColor = categoryColors[habit.category] || categoryColors.general

  return (
    <Card padding="md">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">{habit.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-orange-500 font-medium">
              🔥 {streak} {streak === 1 ? 'day' : 'days'}
            </span>
            <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', catColor.bg, catColor.text)}>
              {habit.category}
            </span>
          </div>
        </div>
        <button
          onClick={() => onDelete(habit.id)}
          className="text-gray-300 hover:text-red-400 transition-colors p-1"
          title="Delete habit"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* 7-day grid */}
      <div className="grid grid-cols-7 gap-2">
        {weekDates.map(({ date, label, isToday }) => {
          const isCompleted = completionSet.has(date)
          const isFuture = date > new Date().toISOString().split('T')[0]

          return (
            <button
              key={date}
              onClick={() => !isFuture && onToggle(habit.id, date)}
              disabled={isFuture}
              className={clsx(
                'flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-150',
                isFuture && 'opacity-40 cursor-not-allowed',
                !isFuture && 'cursor-pointer hover:scale-105',
                isCompleted && 'bg-brand-600 text-white shadow-sm',
                !isCompleted && !isFuture && 'bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700',
                isToday && !isCompleted && 'ring-2 ring-brand-400 dark:ring-brand-500'
              )}
            >
              <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
              <span className={clsx('text-sm font-bold', isCompleted ? 'text-white' : 'text-gray-700 dark:text-gray-300')}>
                {isCompleted ? '✓' : parseInt(date.split('-')[2])}
              </span>
            </button>
          )
        })}
      </div>
    </Card>
  )
}
