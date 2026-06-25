import { clsx } from 'clsx'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
  color?: 'default' | 'primary' | 'secondary' | 'accent' | 'success' | 'danger'
}

const colorBorders = {
  default: 'border-neo-border',
  primary: 'border-neo-primary',
  secondary: 'border-neo-secondary',
  accent: 'border-neo-accent',
  success: 'border-neo-success',
  danger: 'border-neo-danger',
}

export default function Card({
  children,
  className,
  hover = false,
  padding = 'md',
  color = 'default',
}: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={
        hover
          ? { y: -3, x: -3, boxShadow: '6px 6px 0px 0px #2d2d2d' }
          : {}
      }
      className={clsx(
        'bg-neo-surface border-3 rounded-xl shadow-neo',
        colorBorders[color],
        {
          'p-0': padding === 'none',
          'p-4': padding === 'sm',
          'p-6': padding === 'md',
          'p-8': padding === 'lg',
          'cursor-pointer': hover,
        },
        className
      )}
    >
      {children}
    </motion.div>
  )
}
