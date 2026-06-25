import { useEffect, useState } from 'react'
import { useGoalStore } from '../store/goalStore'
import Layout from '../components/layout/Layout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { clsx } from 'clsx'

export default function GoalsPage() {
  const { goals, fetchGoals, addGoal, updateGoal, deleteGoal, isLoading } = useGoalStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'abandoned'>('all')

  useEffect(() => { fetchGoals() }, [fetchGoals])

  const filteredGoals = filter === 'all' ? goals : goals.filter((g) => g.status === filter)

  const handleSubmit = async () => {
    if (!title.trim()) return
    if (editingGoal) {
      await updateGoal(editingGoal, { title, description, targetDate: targetDate || undefined })
    } else {
      await addGoal({ title, description, targetDate: targetDate || undefined })
    }
    resetForm()
  }

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setTargetDate('')
    setEditingGoal(null)
    setIsModalOpen(false)
  }

  const handleEdit = (goal: typeof goals[0]) => {
    setEditingGoal(goal.id)
    setTitle(goal.title)
    setDescription(goal.description || '')
    setTargetDate(goal.targetDate || '')
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this goal? Tasks linked to it will be unlinked.')) {
      await deleteGoal(id)
    }
  }

  const handleStatusChange = async (id: string, status: 'active' | 'completed' | 'abandoned') => {
    await updateGoal(id, { status, progress: status === 'completed' ? 100 : undefined })
  }

  const statusColors: Record<string, string> = {
    active: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    abandoned: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Goals</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Set goals and track your progress</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Goal
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {(['all', 'active', 'completed', 'abandoned'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                filter === f ? 'bg-brand-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              )}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Goals List */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600" />
          </div>
        ) : filteredGoals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-4">🎯</p>
            <p className="text-gray-600 dark:text-gray-400">No goals yet</p>
            <Button variant="secondary" className="mt-4" onClick={() => setIsModalOpen(true)}>Create your first goal</Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredGoals.map((goal) => (
              <Card key={goal.id}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className={clsx('text-lg font-semibold', goal.status === 'completed' && 'line-through text-gray-400')}>
                        {goal.title}
                      </h3>
                      <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', statusColors[goal.status])}>
                        {goal.status}
                      </span>
                    </div>
                    {goal.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{goal.description}</p>}
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      {goal.targetDate && <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>}
                      {goal.stats && <span>{goal.stats.completedTasks}/{goal.stats.totalTasks} tasks done</span>}
                      {goal.stats && <span>{goal.stats.totalHabits} habits linked</span>}
                    </div>
                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">Progress</span>
                        <span className="text-xs font-medium text-brand-600">{goal.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-600 rounded-full transition-all" style={{ width: `${goal.progress}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {goal.status === 'active' && (
                      <>
                        <button onClick={() => handleStatusChange(goal.id, 'completed')} className="text-green-500 hover:text-green-600 text-sm">✓ Done</button>
                        <button onClick={() => handleStatusChange(goal.id, 'abandoned')} className="text-gray-400 hover:text-gray-500 text-sm">Abandon</button>
                      </>
                    )}
                    <button onClick={() => handleEdit(goal)} className="text-gray-400 hover:text-brand-600 text-sm">Edit</button>
                    <button onClick={() => handleDelete(goal.id)} className="text-gray-400 hover:text-red-500 text-sm">Delete</button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Goal Modal */}
      <Modal isOpen={isModalOpen} onClose={resetForm} title={editingGoal ? 'Edit Goal' : 'Create New Goal'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What do you want to achieve?"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Date (optional)</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={resetForm}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingGoal ? 'Save' : 'Create Goal'}</Button>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}
