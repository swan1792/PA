import { useRef, useEffect } from 'react'
import { clsx } from 'clsx'
import Card from '../ui/Card'

interface QuickNotesProps {
  content: string
  lastSaved: string | null
  isSaving: boolean
  onChange: (content: string) => void
}

export default function QuickNotes({ content, lastSaved, isSaving, onChange }: QuickNotesProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea to fit content
  useEffect(() => {
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = `${Math.max(el.scrollHeight, 256)}px`
    }
  }, [content])

  const formatSavedTime = (iso: string) => {
    const date = new Date(iso)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMin = Math.floor(diffMs / 60000)

    if (diffMin < 1) return 'Saved just now'
    if (diffMin < 60) return `Saved ${diffMin}m ago`
    return `Saved at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  }

  return (
    <Card padding="none" className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-2">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Notes</h2>
        <span
          className={clsx(
            'text-xs font-medium transition-colors duration-300',
            isSaving
              ? 'text-amber-500 dark:text-amber-400'
              : 'text-gray-400 dark:text-gray-500'
          )}
        >
          {isSaving ? 'Saving…' : lastSaved ? formatSavedTime(lastSaved) : ''}
        </span>
      </div>

      {/* Textarea */}
      <div className="flex-1 px-6 pb-6">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Jot something down…"
          className={clsx(
            'w-full min-h-[16rem] resize-none',
            'bg-transparent border-0 p-0',
            'text-sm text-gray-700 dark:text-gray-300',
            'placeholder:text-gray-300 dark:placeholder:text-gray-600',
            'focus:outline-none focus:ring-0',
            'leading-relaxed'
          )}
        />
      </div>
    </Card>
  )
}
