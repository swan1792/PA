import { useState, useEffect } from 'react'
import { useHabitStore } from '../../store/habitStore'
import HabitCard from './HabitCard'
import CreateHabitModal from './CreateHabitModal'
import HabitAnalytics from './HabitAnalytics'
import Button from '../ui/Button'

export default function HabitList() {
  const { habits, fetchHabits, toggleCompletion, deleteHabit, addHabit, isLoading } = useHabitStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)

  useEffect(() => {
    fetchHabits()
  }, [fetchHabits])

  const handleDelete = (id: string) => {
    if (confirm('Delete this habit? This cannot be undone.')) {
      deleteHabit(id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Habits</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Track your daily routines</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowAnalytics(!showAnalytics)}>
            📊 {showAnalytics ? 'Hide' : 'Show'} Analytics
          </Button>
          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Habit
          </Button>
        </div>
      </div>

      {showAnalytics && <HabitAnalytics habits={habits} />}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : habits.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-4xl mb-3">🎯</p>
          <p className="text-gray-500 dark:text-gray-400">No habits yet. Start building consistency!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onToggle={toggleCompletion}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <CreateHabitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={addHabit}
      />
    </div>
  )
}
