import { useState, useRef, useEffect } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'

interface CaptureThoughtModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (thought: string) => void
}

export default function CaptureThoughtModal({ isOpen, onClose, onSubmit }: CaptureThoughtModalProps) {
  const [thought, setThought] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-focus the input when the modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setThought('')
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!thought.trim()) return
    onSubmit(thought.trim())
    setThought('')
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Cmd/Ctrl + Enter to submit
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Capture Thought" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          ref={inputRef}
          value={thought}
          onChange={(e) => setThought(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What's on your mind?"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white resize-none"
        />

        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            ⌘ + Enter to save
          </p>
          <div className="flex gap-3">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={!thought.trim()}>
              Save
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
