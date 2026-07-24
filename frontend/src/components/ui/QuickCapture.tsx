import { useState, useEffect, useRef } from 'react'
import { useTaskStore } from '../../store/taskStore'
import { useNotesStore } from '../../store/notesStore'
import { clsx } from 'clsx'

type CaptureMode = 'task' | 'thought'

export default function QuickCapture() {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<CaptureMode>('task')
  const [title, setTitle] = useState('')
  const [thought, setThought] = useState('')
  const { addTask } = useTaskStore()
  const { content, updateContent } = useNotesStore()
  const inputRef = useRef<HTMLInputElement | null>(null)

  // Keyboard shortcut: Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen, mode])

  const handleSubmit = async () => {
    if (mode === 'task' && title.trim()) {
      await addTask({ title: title.trim(), status: 'todo', priority: 'medium', recurrence: 'none' })
      setTitle('')
    } else if (mode === 'thought' && thought.trim()) {
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      const newContent = content ? `${content}\n\n[${timestamp}] ${thought.trim()}` : `[${timestamp}] ${thought.trim()}`
      updateContent(newContent)
      setThought('')
    }
    setIsOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
    if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <>
      {/* Floating Action Button - Todoist inspired */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-40 w-12 h-12 rounded-full bg-neo-primary text-white shadow-lg hover:bg-neo-primaryHover hover:shadow-xl active:scale-95 transition-all flex items-center justify-center"
        title="Quick Capture (Ctrl+K)"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>

      {/* Quick Capture Modal - clean, minimal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/20 backdrop-blur-sm animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false)
          }}
        >
          <div className="w-full max-w-lg bg-white dark:bg-[#1c1c30] rounded-2xl shadow-modal animate-scale-in overflow-hidden border border-neo-border">
            {/* Mode Tabs */}
            <div className="flex border-b border-neo-border">
              <button
                onClick={() => setMode('task')}
                className={clsx(
                  'flex-1 py-3.5 text-sm font-medium transition-colors relative',
                  mode === 'task' ? 'text-neo-primary' : 'text-neo-muted hover:text-neo-text'
                )}
              >
                📋 Task
                {mode === 'task' && (
                  <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-neo-primary rounded-full" />
                )}
              </button>
              <button
                onClick={() => setMode('thought')}
                className={clsx(
                  'flex-1 py-3.5 text-sm font-medium transition-colors relative',
                  mode === 'thought' ? 'text-neo-primary' : 'text-neo-muted hover:text-neo-text'
                )}
              >
                💭 Thought
                {mode === 'thought' && (
                  <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-neo-primary rounded-full" />
                )}
              </button>
            </div>

            <div className="p-4">
              {mode === 'task' ? (
                <input
                  ref={inputRef}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="What needs to be done?"
                  className="w-full px-0 py-2 text-base border-none bg-transparent text-neo-text placeholder-neo-muted focus:outline-none focus:ring-0"
                  autoFocus
                />
              ) : (
                <textarea
                  ref={inputRef as any}
                  value={thought}
                  onChange={(e) => setThought(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault()
                      handleSubmit()
                    }
                    if (e.key === 'Escape') setIsOpen(false)
                  }}
                  placeholder="Capture a quick thought..."
                  rows={4}
                  className="w-full px-0 py-2 text-base border-none bg-transparent text-neo-text placeholder-neo-muted resize-none focus:outline-none focus:ring-0"
                  autoFocus
                />
              )}

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-neo-border">
                <span className="text-xs text-neo-muted">
                  {mode === 'task' ? 'Enter to add' : 'Ctrl+Enter to save'}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-3.5 py-1.5 text-sm text-neo-textSecondary hover:text-neo-text bg-transparent rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2a40] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-1.5 text-sm font-medium bg-neo-primary text-white rounded-lg hover:bg-neo-primaryHover transition-colors"
                  >
                    {mode === 'task' ? 'Add Task' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
