import { useState, useEffect } from 'react'
import { useCategoryStore } from '../../store/categoryStore'
import { useGoalStore } from '../../store/goalStore'
import Button from '../ui/Button'
import type { Task } from '../../types'

interface TaskFormProps {
  onSubmit: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}

export default function TaskForm({ onSubmit, onCancel }: TaskFormProps) {
  const { categories, fetchCategories } = useCategoryStore()
  const { goals, fetchGoals } = useGoalStore()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Task['priority']>('medium')
  const [dueDate, setDueDate] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [recurrence, setRecurrence] = useState<Task['recurrence']>('none')
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('')
  const [goalId, setGoalId] = useState('')

  useEffect(() => {
    fetchCategories()
    fetchGoals()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      title,
      description: description || undefined,
      status: 'todo',
      priority,
      dueDate: dueDate || undefined,
      categoryId: categoryId || undefined,
      recurrence,
      recurrenceEndDate: recurrenceEndDate || undefined,
      goalId: goalId || undefined,
    })
  }

  const activeGoals = goals.filter((g) => g.status === 'active')

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-neo-text mb-1">
          Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neo-text mb-1">
          Description <span className="text-neo-muted font-normal">(optional)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="input resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neo-text mb-1">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Task['priority'])}
            className="input"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-neo-text mb-1">Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="input"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neo-text mb-1">Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="input"
          >
            <option value="">None</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-neo-text mb-1">Repeat</label>
          <select
            value={recurrence}
            onChange={(e) => setRecurrence(e.target.value as Task['recurrence'])}
            className="input"
          >
            <option value="none">No repeat</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>

      {recurrence !== 'none' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Repeat Until</label>
          <input
            type="date"
            value={recurrenceEndDate}
            onChange={(e) => setRecurrenceEndDate(e.target.value)}
            className="input"
          />
        </div>
      )}

      {activeGoals.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-neo-text mb-1">Link to Goal <span className="text-neo-muted font-normal">(optional)</span></label>
          <select
            value={goalId}
            onChange={(e) => setGoalId(e.target.value)}
            className="input"
          >
            <option value="">None</option>
            {activeGoals.map((g) => (
              <option key={g.id} value={g.id}>{g.title}</option>
            ))}
          </select>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          Create Task
        </Button>
      </div>
    </form>
  )
}
