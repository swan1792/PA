import { useState, useEffect, useRef } from 'react'
import { useTaskStore } from '../../store/taskStore'
import { useNotesStore } from '../../store/notesStore'
import Modal from './Modal'
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

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-brand-600 text-white shadow-lg hover:bg-brand-700 hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center"
        title="Quick Capture (Ctrl+K)"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Quick Capture" size="sm">
        {/* Mode Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMode('task')}
            className={clsx(
              'flex-1 py-2 rounded-lg text-sm font-medium transition-colors',
              mode === 'task' ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            )}
          >
            📋 Task
          </button>
          <button
            onClick={() => setMode('thought')}
            className={clsx(
              'flex-1 py-2 rounded-lg text-sm font-medium transition-colors',
              mode === 'thought' ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            )}
          >
            💭 Thought
          </button>
        </div>

        {mode === 'task' ? (
          <div>
            <input
              ref={inputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="What needs to be done?"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-base"
            />
            <p className="text-xs text-gray-400 mt-2">Press Enter to create</p>
          </div>
        ) : (
          <div>
            <textarea
              value={thought}
              onChange={(e) => setThought(e.target.value)}
              placeholder="Capture a quick thought..."
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 resize-none text-base"
            />
            <p className="text-xs text-gray-400 mt-2">Ctrl+Enter to save</p>
          </div>
        )}

        <div className="flex gap-3 justify-end mt-4">
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700"
          >
            {mode === 'task' ? 'Create Task' : 'Save Thought'}
          </button>
        </div>
      </Modal>
    </>
  )
}
