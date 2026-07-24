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
    <Card hover>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={clsx('text-sm font-medium', task.status === 'done' ? 'line-through text-neo-muted' : 'text-neo-text')}>
              {task.title}
            </h3>
            {category && (
              <span className="text-xs px-2 py-0.5 rounded-pill font-medium" style={{ backgroundColor: category.color + '20', color: category.color }}>
                {category.icon} {category.name}
              </span>
            )}
            {task.recurrence && task.recurrence !== 'none' && (
              <span className="text-xs px-2 py-0.5 rounded-pill bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                🔁 {task.recurrence}
              </span>
            )}
          </div>
          {task.description && (
            <p className="mt-1 text-sm text-neo-textSecondary">{task.description}</p>
          )}
          <div className="mt-2.5 flex items-center gap-2">
            <Badge variant={task.status}>
              {task.status.replace('_', ' ')}
            </Badge>
            <Badge variant={task.priority}>
              {task.priority}
            </Badge>
            {task.dueDate && (
              <span className={clsx('text-xs', task.dueDate < new Date().toISOString().split('T')[0] && task.status !== 'done' ? 'text-red-500 font-medium' : 'text-neo-muted')}>
                Due: {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <select
            value={task.status}
            onChange={(e) => onStatusChange(task.id, e.target.value as Task['status'])}
            className="text-xs border border-neo-border rounded-lg px-2 py-1.5 bg-white dark:bg-[#1c1c30] text-neo-text focus:outline-none focus:ring-1 focus:ring-neo-primary"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s.replace('_', ' ')}
              </option>
            ))}
          </select>
          <button
            onClick={() => onDelete(task.id)}
            className="text-neo-muted hover:text-neo-danger transition-colors p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      </div>
    </Card>
  )
}
