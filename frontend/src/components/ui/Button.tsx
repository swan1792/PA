import { clsx } from 'clsx'
import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
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
    <button
      className={clsx(
        'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 shadow-button focus:outline-none',
        {
          // Variants
          'bg-neo-primary text-white hover:bg-neo-primaryHover active:bg-indigo-700':
            variant === 'primary',
          'bg-white text-neo-text border border-neo-border hover:bg-gray-50 active:bg-gray-100 dark:bg-[#1c1c30] dark:hover:bg-[#2a2a40] dark:border-[#2a2a40]':
            variant === 'secondary',
          'bg-transparent text-neo-textSecondary hover:text-neo-text hover:bg-gray-100 dark:hover:bg-[#2a2a40] shadow-none':
            variant === 'ghost',
          'bg-neo-danger text-white hover:bg-red-600 active:bg-red-700':
            variant === 'danger',
          'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800':
            variant === 'accent',
          // Sizes
          'px-3 py-1.5 text-xs gap-1.5': size === 'sm',
          'px-4 py-2 text-sm gap-2': size === 'md',
          'px-5 py-2.5 text-base gap-2': size === 'lg',
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
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  )
}
