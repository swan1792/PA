import { clsx } from 'clsx'
import { motion } from 'framer-motion'

interface BadgeProps {
  variant: 'todo' | 'in_progress' | 'done' | 'low' | 'medium' | 'high'
  children: React.ReactNode
}

const variants = {
  todo: 'bg-gray-200 text-neo-border',
  in_progress: 'bg-neo-blue text-white',
  done: 'bg-neo-success text-neo-border',
  low: 'bg-gray-200 text-neo-muted',
  medium: 'bg-neo-warning text-neo-border',
  high: 'bg-neo-danger text-white',
}

export default function Badge({ variant, children }: BadgeProps) {
  return (
    <motion.span
      whileHover={{ rotate: [-2, 2, 0], transition: { duration: 0.3 } }}
      className={clsx(
        'inline-flex items-center px-3 py-1 border-2 border-neo-border rounded-full text-xs font-bold shadow-neo-sm',
        variants[variant]
      )}
    >
      {children}
    </motion.span>
  )
}
