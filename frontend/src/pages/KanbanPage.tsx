import { useEffect, useState, useRef } from 'react'
import { useTaskStore } from '../store/taskStore'
import { useCategoryStore } from '../store/categoryStore'
import Layout from '../components/layout/Layout'
import Button from '../components/ui/Button'
import { clsx } from 'clsx'
import type { Task } from '../types'

const COLUMNS: { status: Task['status']; label: string; color: string }[] = [
  { status: 'todo', label: 'To Do', color: 'border-t-gray-300 dark:border-t-gray-600' },
  { status: 'in_progress', label: 'In Progress', color: 'border-t-blue-400' },
  { status: 'done', label: 'Done', color: 'border-t-emerald-400' },
]

export default function KanbanPage() {
  const { tasks, fetchTasks, updateTask, addTask } = useTaskStore()
  const { categories, fetchCategories } = useCategoryStore()
  const [draggedTask, setDraggedTask] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)
  const [quickAddColumn, setQuickAddColumn] = useState<string | null>(null)
  const [quickAddTitle, setQuickAddTitle] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchTasks()
    fetchCategories()
  }, [])

  useEffect(() => {
    if (quickAddColumn && inputRef.current) inputRef.current.focus()
  }, [quickAddColumn])

  const filteredTasks = filterCategory === 'all' ? tasks : tasks.filter((t) => t.categoryId === filterCategory)

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTask(taskId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverColumn(status)
  }

  const handleDrop = (e: React.DragEvent, status: Task['status']) => {
    e.preventDefault()
    if (draggedTask) {
      updateTask(draggedTask, { status })
    }
    setDraggedTask(null)
    setDragOverColumn(null)
  }

  const handleDragEnd = () => {
    setDraggedTask(null)
    setDragOverColumn(null)
  }

  const handleQuickAdd = async (status: Task['status']) => {
    if (!quickAddTitle.trim()) return
    await addTask({ title: quickAddTitle.trim(), status, priority: 'medium', recurrence: 'none' })
    setQuickAddTitle('')
    setQuickAddColumn(null)
  }

  const priorityColors: Record<string, string> = {
    high: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-300',
    medium: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-300',
    low: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-300',
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="page-header">
          <div className="page-header-row">
            <div>
              <h1>Board</h1>
              <p>Drag tasks between columns</p>
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="input text-sm w-auto"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {COLUMNS.map((col) => {
            const columnTasks = filteredTasks.filter((t) => t.status === col.status)
            return (
              <div
                key={col.status}
                className={clsx(
                  'bg-gray-50 dark:bg-[#1a1a2a] rounded-xl border-t-[3px] p-4 min-h-[400px] transition-colors',
                  col.color,
                  dragOverColumn === col.status && 'bg-blue-50 dark:bg-blue-900/10'
                )}
                onDragOver={(e) => handleDragOver(e, col.status)}
                onDrop={(e) => handleDrop(e, col.status)}
                onDragLeave={() => setDragOverColumn(null)}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-neo-text">
                    {col.label}
                    <span className="ml-2 text-xs text-neo-muted font-normal">({columnTasks.length})</span>
                  </h3>
                  <button
                    onClick={() => setQuickAddColumn(col.status)}
                    className="text-neo-muted hover:text-neo-text transition-colors p-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </button>
                </div>

                {/* Quick Add */}
                {quickAddColumn === col.status && (
                  <div className="mb-3 animate-slide-down">
                    <input
                      ref={inputRef}
                      value={quickAddTitle}
                      onChange={(e) => setQuickAddTitle(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd(col.status)}
                      placeholder="Task title..."
                      className="input text-sm"
                    />
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" onClick={() => handleQuickAdd(col.status)}>Add</Button>
                      <Button size="sm" variant="ghost" onClick={() => { setQuickAddColumn(null); setQuickAddTitle('') }}>Cancel</Button>
                    </div>
                  </div>
                )}

                {/* Task Cards */}
                <div className="space-y-2.5">
                  {columnTasks.map((task) => {
                    const category = categories.find((c) => c.id === task.categoryId)
                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onDragEnd={handleDragEnd}
                        className={clsx(
                          'card p-3.5 cursor-grab active:cursor-grabbing',
                          draggedTask === task.id && 'opacity-50'
                        )}
                      >
                        <p className="text-sm font-medium text-neo-text">{task.title}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className={clsx('text-xs px-2 py-0.5 rounded-pill font-medium', priorityColors[task.priority])}>
                            {task.priority}
                          </span>
                          {category && (
                            <span className="text-xs px-2 py-0.5 rounded-pill" style={{ backgroundColor: category.color + '20', color: category.color }}>
                              {category.icon} {category.name}
                            </span>
                          )}
                          {task.recurrence !== 'none' && (
                            <span className="text-xs text-neo-muted">🔁 {task.recurrence}</span>
                          )}
                        </div>
                        {task.dueDate && (
                          <p className="text-xs text-neo-muted mt-1.5">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Layout>
  )
}
