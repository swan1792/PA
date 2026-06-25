import { useCategoryStore } from '../../store/categoryStore'
import Badge from '../ui/Badge'
import Card from '../ui/Card'
import { clsx } from 'clsx'
import type { Task } from '../../types'

interface TaskCardProps {
  task: Task
  onStatusChange: (id: string, status: Task['status']) => void
  onDelete: (id: string) => void
}

export default function TaskCard({ task, onStatusChange, onDelete }: TaskCardProps) {
  const { categories } = useCategoryStore()
  const category = categories.find((c) => c.id === task.categoryId)
  const statusOptions: Task['status'][] = ['todo', 'in_progress', 'done']

  return (
    <Card hover className="relative">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={clsx('font-medium text-gray-900 dark:text-white', task.status === 'done' && 'line-through text-gray-400')}>
              {task.title}
            </h3>
            {category && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: category.color + '20', color: category.color }}>
                {category.icon} {category.name}
              </span>
            )}
            {task.recurrence && task.recurrence !== 'none' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                🔁 {task.recurrence}
              </span>
            )}
          </div>
          {task.description && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{task.description}</p>
          )}
          <div className="mt-3 flex items-center gap-2">
            <Badge variant={task.status}>
              {task.status.replace('_', ' ')}
            </Badge>
            <Badge variant={task.priority}>
              {task.priority}
            </Badge>
            {task.dueDate && (
              <span className={clsx('text-xs', task.dueDate < new Date().toISOString().split('T')[0] && task.status !== 'done' ? 'text-red-500 font-medium' : 'text-gray-500')}>
                Due: {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={task.status}
            onChange={(e) => onStatusChange(task.id, e.target.value as Task['status'])}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s.replace('_', ' ')}
              </option>
            ))}
          </select>
          <button
            onClick={() => onDelete(task.id)}
            className="text-red-500 hover:text-red-700 transition-colors p-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </Card>
  )
}
