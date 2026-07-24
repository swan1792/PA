import { useEffect, useState } from 'react'
import { useTaskStore } from '../store/taskStore'
import { useCategoryStore } from '../store/categoryStore'
import Layout from '../components/layout/Layout'
import TaskCard from '../components/tasks/TaskCard'
import TaskForm from '../components/tasks/TaskForm'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'

export default function TasksPage() {
  const { tasks, fetchTasks, addTask, updateTask, deleteTask, isLoading } = useTaskStore()
  const { categories, fetchCategories } = useCategoryStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'todo' | 'in_progress' | 'done'>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchTasks()
    fetchCategories()
  }, [fetchTasks, fetchCategories])

  const filteredTasks = tasks
    .filter((t) => filter === 'all' || t.status === filter)
    .filter((t) => filterCategory === 'all' || t.categoryId === filterCategory)
    .filter((t) => {
      if (!searchQuery) return true
      const q = searchQuery.toLowerCase()
      return t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)
    })

  const handleCreateTask = async (taskData: Parameters<typeof addTask>[0]) => {
    await addTask(taskData)
    setIsModalOpen(false)
  }

  const handleStatusChange = async (id: string, status: string) => {
    await updateTask(id, { status: status as any })
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(id)
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="page-header">
          <div className="page-header-row">
            <div>
              <h1>Tasks</h1>
              <p>Manage your tasks and track progress</p>
            </div>
            <Button onClick={() => setIsModalOpen(true)}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              New Task
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neo-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="input pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {(['all', 'todo', 'in_progress', 'done'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={filter === f ? 'pill-active' : 'pill-inactive'}
            >
              {f === 'all' ? 'All' : f.replace('_', ' ')}
            </button>
          ))}

          {categories.length > 0 && (
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
          )}
        </div>

        {/* Task List */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-neo-primary border-t-transparent"></div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-[#2a2a40] flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-neo-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-neo-textSecondary text-sm mb-4">
              {searchQuery ? 'No tasks match your search' : 'No tasks yet'}
            </p>
            <Button variant="secondary" onClick={() => setIsModalOpen(true)}>
              Create your first task
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Task">
        <TaskForm
          onSubmit={handleCreateTask}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </Layout>
  )
}
