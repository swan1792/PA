import { useState, useRef, useEffect } from 'react'
import { clsx } from 'clsx'
import Modal from '../ui/Modal'
import Button from '../ui/Button'

interface CreateHabitModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (habit: {
    name: string
    frequency: 'daily' | 'specific'
    specificDays?: string[]
    category?: string
  }) => void
}

const DAYS = [
  { key: 'sun', label: 'S' },
  { key: 'mon', label: 'M' },
  { key: 'tue', label: 'T' },
  { key: 'wed', label: 'W' },
  { key: 'thu', label: 'T' },
  { key: 'fri', label: 'F' },
  { key: 'sat', label: 'S' },
]

const CATEGORIES = ['general', 'health', 'fitness', 'learning', 'mindfulness', 'productivity']

export default function CreateHabitModal({ isOpen, onClose, onSubmit }: CreateHabitModalProps) {
  const [name, setName] = useState('')
  const [frequency, setFrequency] = useState<'daily' | 'specific'>('daily')
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [category, setCategory] = useState('general')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setName('')
      setFrequency('daily')
      setSelectedDays([])
      setCategory('general')
    }
  }, [isOpen])

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit({
      name: name.trim(),
      frequency,
      specificDays: frequency === 'specific' ? selectedDays : undefined,
      category,
    })
    onClose()
  }

  const isValid = name.trim() && (frequency === 'daily' || selectedDays.length > 0)

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Habit" size="sm">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Habit Name *
          </label>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Exercise, Read, Meditate"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Frequency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Frequency
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setFrequency('daily')}
              className={clsx(
                'flex-1 py-2 px-4 rounded-lg text-sm font-medium border transition-all',
                frequency === 'daily'
                  ? 'bg-brand-50 border-brand-500 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                  : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400'
              )}
            >
              Daily
            </button>
            <button
              type="button"
              onClick={() => setFrequency('specific')}
              className={clsx(
                'flex-1 py-2 px-4 rounded-lg text-sm font-medium border transition-all',
                frequency === 'specific'
                  ? 'bg-brand-50 border-brand-500 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                  : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400'
              )}
            >
              Specific Days
            </button>
          </div>
        </div>

        {/* Day picker (only when specific) */}
        {frequency === 'specific' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Days
            </label>
            <div className="flex gap-2">
              {DAYS.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleDay(key)}
                  className={clsx(
                    'w-10 h-10 rounded-full text-sm font-semibold transition-all',
                    selectedDays.includes(key)
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={!isValid}>
            Create Habit
          </Button>
        </div>
      </form>
    </Modal>
  )
}
