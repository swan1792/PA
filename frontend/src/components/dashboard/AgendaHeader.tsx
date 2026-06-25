import Button from '../ui/Button'

interface AgendaHeaderProps {
  onCaptureThought: () => void
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function AgendaHeader({ onCaptureThought }: AgendaHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-brand-600 dark:text-brand-400 tracking-wide uppercase">
          {formatDate()}
        </p>
        <h1 className="mt-1 text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
          {getGreeting()} 👋
        </h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Here's what's on your plate today.
        </p>
      </div>

      <Button variant="primary" size="md" onClick={onCaptureThought}>
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        Capture Thought
      </Button>
    </div>
  )
}
