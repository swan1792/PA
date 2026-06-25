import { clsx } from 'clsx'
import { motion, HTMLMotionProps } from 'framer-motion'
import { ReactNode } from 'react'

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  children: ReactNode
}

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={disabled || isLoading ? {} : { y: -2, boxShadow: '4px 4px 0px 0px #2d2d2d' }}
      whileTap={disabled || isLoading ? {} : { y: 2, x: 2, boxShadow: '0px 0px 0px 0px #2d2d2d' }}
      transition={{ duration: 0.1 }}
      className={clsx(
        'inline-flex items-center justify-center font-bold border-3 border-neo-border rounded-lg shadow-neo-sm transition-colors focus:outline-none',
        {
          // Variants
          'bg-neo-primary text-white hover:bg-red-500': variant === 'primary',
          'bg-neo-secondary text-neo-border hover:bg-teal-400': variant === 'secondary',
          'bg-transparent border-transparent shadow-none hover:bg-gray-100 dark:hover:bg-gray-800': variant === 'ghost',
          'bg-neo-danger text-white hover:bg-red-600': variant === 'danger',
          'bg-neo-accent text-neo-border hover:bg-yellow-300': variant === 'accent',
          // Sizes
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-5 py-2.5 text-base': size === 'md',
          'px-7 py-3.5 text-lg': size === 'lg',
          // Disabled
          'opacity-50 cursor-not-allowed': disabled || isLoading,
        },
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <motion.svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </motion.svg>
          Loading...
        </>
      ) : (
        children
      )}
    </motion.button>
  )
}
