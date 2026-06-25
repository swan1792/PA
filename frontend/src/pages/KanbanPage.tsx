import { useEffect, useState, useRef } from 'react'
import { useTaskStore } from '../store/taskStore'
import { useCategoryStore } from '../store/categoryStore'
import Layout from '../components/layout/Layout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { clsx } from 'clsx'
import type { Task } from '../types'

const COLUMNS: { status: Task['status']; label: string; color: string }[] = [
  { status: 'todo', label: 'To Do', color: 'border-gray-400' },
  { status: 'in_progress', label: 'In Progress', color: 'border-blue-500' },
  { status: 'done', label: 'Done', color: 'border-green-500' },
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
    high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Kanban Board</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Drag tasks between columns</p>
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COLUMNS.map((col) => {
            const columnTasks = filteredTasks.filter((t) => t.status === col.status)
            return (
              <div
                key={col.status}
                className={clsx(
                  'rounded-xl border-t-4 bg-gray-50 dark:bg-gray-900/50 p-4 min-h-[400px] transition-colors',
                  col.color,
                  dragOverColumn === col.status && 'bg-brand-50 dark:bg-brand-900/10'
                )}
                onDragOver={(e) => handleDragOver(e, col.status)}
                onDrop={(e) => handleDrop(e, col.status)}
                onDragLeave={() => setDragOverColumn(null)}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {col.label}
                    <span className="ml-2 text-sm text-gray-400">({columnTasks.length})</span>
                  </h3>
                  <button
                    onClick={() => setQuickAddColumn(col.status)}
                    className="text-gray-400 hover:text-brand-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>

                {/* Quick Add */}
                {quickAddColumn === col.status && (
                  <div className="mb-3">
                    <input
                      ref={inputRef}
                      value={quickAddTitle}
                      onChange={(e) => setQuickAddTitle(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd(col.status)}
                      placeholder="Task title..."
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    />
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" onClick={() => handleQuickAdd(col.status)}>Add</Button>
                      <Button size="sm" variant="ghost" onClick={() => { setQuickAddColumn(null); setQuickAddTitle('') }}>Cancel</Button>
                    </div>
                  </div>
                )}

                {/* Task Cards */}
                <div className="space-y-3">
                  {columnTasks.map((task) => {
                    const category = categories.find((c) => c.id === task.categoryId)
                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onDragEnd={handleDragEnd}
                        className={clsx(
                          'bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700 cursor-grab active:cursor-grabbing transition-all hover:shadow-md',
                          draggedTask === task.id && 'opacity-50'
                        )}
                      >
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', priorityColors[task.priority])}>
                            {task.priority}
                          </span>
                          {category && (
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: category.color + '20', color: category.color }}>
                              {category.icon} {category.name}
                            </span>
                          )}
                          {task.recurrence !== 'none' && (
                            <span className="text-xs text-gray-400">🔁 {task.recurrence}</span>
                          )}
                        </div>
                        {task.dueDate && (
                          <p className="text-xs text-gray-400 mt-1">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
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
