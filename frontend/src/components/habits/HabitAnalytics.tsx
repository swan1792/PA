import { useMemo } from 'react'
import type { Habit } from '../../types'
import Card from '../ui/Card'

interface HabitAnalyticsProps {
  habits: Habit[]
}

export default function HabitAnalytics({ habits }: HabitAnalyticsProps) {
  const analytics = useMemo(() => {
    if (habits.length === 0) return null

    // Completion rate over last 30 days
    const today = new Date()
    let totalPossible = 0
    let totalCompleted = 0

    habits.forEach((h) => {
      for (let i = 0; i < 30; i++) {
        const d = new Date(today)
        d.setDate(today.getDate() - i)
        const dateStr = d.toISOString().split('T')[0]
        const dayName = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][d.getDay()]

        const isScheduled = h.frequency === 'daily' || (h.specificDays && h.specificDays.includes(dayName))
        if (isScheduled) {
          totalPossible++
          if (h.completions.includes(dateStr)) totalCompleted++
        }
      }
    })

    const overallRate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0

    // Category breakdown
    const categoryMap: Record<string, { total: number; completed: number }> = {}
    habits.forEach((h) => {
      if (!categoryMap[h.category]) categoryMap[h.category] = { total: 0, completed: 0 }
      categoryMap[h.category].total++
      categoryMap[h.category].completed += h.completions.length
    })

    // Best habits by streak
    const habitsWithStreak = habits.map((h) => ({
      name: h.name,
      streak: calcStreak(h.completions, h.frequency, h.specificDays),
      category: h.category,
    })).sort((a, b) => b.streak - a.streak)

    return { overallRate, categoryMap, habitsWithStreak }
  }, [habits])

  if (!analytics || habits.length === 0) {
    return (
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">📊 Habit Analytics</h3>
        <p className="text-sm text-gray-500">Add habits to see analytics</p>
      </Card>
    )
  }

  const categoryColors: Record<string, string> = {
    health: '#10b981', fitness: '#3b82f6', learning: '#f59e0b',
    mindfulness: '#8b5cf6', productivity: '#f43f5e', general: '#6b7280',
  }

  // Simple bar chart data (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const dateStr = d.toISOString().split('T')[0]
    const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()]
    const completed = habits.filter((h) => h.completions.includes(dateStr)).length
    return { label: dayName, completed, total: habits.length }
  })
  const maxCompleted = Math.max(...last7Days.map((d) => d.completed), 1)

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📊 Habit Analytics</h3>

      {/* Overall Rate */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-brand-50 dark:bg-brand-900/20">
          <span className="text-3xl font-bold text-brand-600">{analytics.overallRate}%</span>
        </div>
        <p className="text-sm text-gray-500 mt-2">30-Day Completion Rate</p>
      </div>

      {/* Last 7 Days Bar Chart */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Last 7 Days</h4>
        <div className="flex items-end gap-2 h-32">
          {last7Days.map((day, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-gray-500">{day.completed}</span>
              <div className="w-full flex justify-center">
                <div
                  className="w-6 rounded-t bg-brand-500 transition-all"
                  style={{ height: `${(day.completed / maxCompleted) * 80}px` }}
                />
              </div>
              <span className="text-[10px] text-gray-400">{day.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">By Category</h4>
        <div className="space-y-2">
          {Object.entries(analytics.categoryMap).map(([cat, data]) => (
            <div key={cat} className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: categoryColors[cat] || '#6b7280' }} />
              <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 capitalize">{cat}</span>
              <span className="text-xs text-gray-500">{data.total} habits</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Streaks */}
      <div>
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Top Streaks</h4>
        <div className="space-y-2">
          {analytics.habitsWithStreak.slice(0, 5).map((h, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <span className="text-sm text-gray-700 dark:text-gray-300">{h.name}</span>
              <span className="text-sm font-medium text-orange-500">🔥 {h.streak} days</span>
            </div>
          ))}
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
      d.setDate(d.getDate() - 1); continue
    }
    if (completionSet.has(dateStr)) { streak++; d.setDate(d.getDate() - 1) }
    else {
      if (i === 0 && dateStr === today) { d.setDate(d.getDate() - 1); continue }
      break
    }
  }
  return streak
}
