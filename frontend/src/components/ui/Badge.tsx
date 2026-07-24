import { clsx } from 'clsx'

interface BadgeProps {
  variant: 'todo' | 'in_progress' | 'done' | 'low' | 'medium' | 'high'
  children: React.ReactNode
}

const styles = {
  todo: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  in_progress: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
  done: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300',
  low: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  medium: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300',
  high: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300',
}

export default function Badge({ variant, children }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-pill text-xs font-medium',
        styles[variant]
      )}
    >
      {children}
    </span>
  )
}
