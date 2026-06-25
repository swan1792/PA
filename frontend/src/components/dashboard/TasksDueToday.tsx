import { clsx } from 'clsx'
import type { Task } from '../../types'
import Card from '../ui/Card'

interface TasksDueTodayProps {
  tasks: Task[]
  onToggleComplete: (id: string) => void
  isLoading: boolean
}

const priorityConfig = {
  high: {
    label: 'High',
    dot: 'bg-red-500',
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-l-red-500',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  },
  medium: {
    label: 'Medium',
    dot: 'bg-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-l-amber-500',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  },
  low: {
    label: 'Low',
    dot: 'bg-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-l-emerald-500',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
}

export default function TasksDueToday({ tasks, onToggleComplete, isLoading }: TasksDueTodayProps) {
  if (isLoading) {
    return (
      <Card>
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tasks Due Today</h2>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tasks Due Today</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
          </span>
        </div>

        {tasks.length === 0 ? (
          <div className="py-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="mt-3 text-gray-500 dark:text-gray-400">All clear for today! 🎉</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {tasks.map((task) => {
              const config = priorityConfig[task.priority]
              return (
                <li key={task.id}>
                  <label
                    className={clsx(
                      'flex items-start gap-3 p-4 rounded-lg border-l-4 cursor-pointer transition-all duration-200',
                      'hover:shadow-sm',
                      config.border,
                      config.bg
                    )}
                  >
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={false}
                      onChange={() => onToggleComplete(task.id)}
                      className={clsx(
                        'mt-0.5 h-5 w-5 rounded border-gray-300 dark:border-gray-600 focus:ring-brand-500',
                        'cursor-pointer accent-brand-600'
                      )}
                    />

                    {/* Task content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                    </div>

                    {/* Priority badge */}
                    <span
                      className={clsx(
                        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0',
                        config.badge
                      )}
                    >
                      <span className={clsx('w-1.5 h-1.5 rounded-full', config.dot)} />
                      {config.label}
                    </span>
                  </label>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </Card>
  )
}
