import { useEffect, useState } from 'react'
import { useTaskStore } from '../../store/taskStore'
import { useNotesStore } from '../../store/notesStore'
import AgendaHeader from './AgendaHeader'
import TasksDueToday from './TasksDueToday'
import QuickNotes from './QuickNotes'
import CaptureThoughtModal from './CaptureThoughtModal'

export default function DailyAgendaDashboard() {
  const { tasks, fetchTasks, updateTask, isLoading: tasksLoading } = useTaskStore()
  const { content, lastSaved, isSaving, fetchNotes, updateContent } = useNotesStore()
  const [thoughtModalOpen, setThoughtModalOpen] = useState(false)

  useEffect(() => {
    fetchTasks()
    fetchNotes()
  }, [fetchTasks, fetchNotes])

  // Filter to tasks due today (or overdue) that aren't done
  const today = new Date().toISOString().split('T')[0]
  const todaysTasks = tasks
    .filter((t) => t.dueDate && t.dueDate <= today && t.status !== 'done')
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })

  const handleToggleComplete = async (id: string) => {
    await updateTask(id, { status: 'done' })
  }

  const handleCaptureThought = async (thought: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const newContent = content
      ? `${content}\n\n[${timestamp}] ${thought}`
      : `[${timestamp}] ${thought}`
    updateContent(newContent)
  }

  return (
    <div className="space-y-8">
      <AgendaHeader onCaptureThought={() => setThoughtModalOpen(true)} />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left column — wider for task list */}
        <div className="lg:col-span-3">
          <TasksDueToday
            tasks={todaysTasks}
            onToggleComplete={handleToggleComplete}
            isLoading={tasksLoading}
          />
        </div>

        {/* Right column — narrower for notes */}
        <div className="lg:col-span-2">
          <QuickNotes
            content={content}
            lastSaved={lastSaved}
            isSaving={isSaving}
            onChange={updateContent}
          />
        </div>
      </div>

      <CaptureThoughtModal
        isOpen={thoughtModalOpen}
        onClose={() => setThoughtModalOpen(false)}
        onSubmit={handleCaptureThought}
      />
    </div>
  )
}
