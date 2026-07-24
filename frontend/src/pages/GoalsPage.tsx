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

  const statusStyles: Record<string, string> = {
    active: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
    completed: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300',
    abandoned: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="page-header">
          <div className="page-header-row">
            <div>
              <h1>Goals</h1>
              <p>Set goals and track your progress</p>
            </div>
            <Button onClick={() => setIsModalOpen(true)}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              New Goal
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {(['all', 'active', 'completed', 'abandoned'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={filter === f ? 'pill-active' : 'pill-inactive'}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Goals List */}
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-neo-primary border-t-transparent" />
          </div>
        ) : filteredGoals.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-[#2a2a40] flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <p className="text-neo-textSecondary text-sm mb-4">No goals yet</p>
            <Button variant="secondary" onClick={() => setIsModalOpen(true)}>Create your first goal</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredGoals.map((goal) => (
              <Card key={goal.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className={clsx('text-base font-semibold', goal.status === 'completed' && 'line-through text-neo-muted')}>
                        {goal.title}
                      </h3>
                      <span className={clsx('text-xs px-2 py-0.5 rounded-pill font-medium', statusStyles[goal.status])}>
                        {goal.status}
                      </span>
                    </div>
                    {goal.description && <p className="text-sm text-neo-textSecondary mt-1">{goal.description}</p>}
                    <div className="flex items-center gap-4 mt-2 text-xs text-neo-muted">
                      {goal.targetDate && <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>}
                      {goal.stats && <span>{goal.stats.completedTasks}/{goal.stats.totalTasks} tasks done</span>}
                    </div>
                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-neo-muted">Progress</span>
                        <span className="text-xs font-medium text-neo-primary">{goal.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 dark:bg-[#2a2a40] rounded-full overflow-hidden">
                        <div className="h-full bg-neo-primary rounded-full transition-all" style={{ width: `${goal.progress}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {goal.status === 'active' && (
                      <>
                        <button onClick={() => handleStatusChange(goal.id, 'completed')} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium px-2 py-1 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors">✓ Done</button>
                        <button onClick={() => handleStatusChange(goal.id, 'abandoned')} className="text-xs text-neo-muted hover:text-neo-textSecondary px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2a40] transition-colors">Abandon</button>
                      </>
                    )}
                    <button onClick={() => handleEdit(goal)} className="text-xs text-neo-muted hover:text-neo-text px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2a40] transition-colors">Edit</button>
                    <button onClick={() => handleDelete(goal.id)} className="text-xs text-neo-muted hover:text-neo-danger px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">Delete</button>
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
            <label className="block text-sm font-medium text-neo-text mb-1">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What do you want to achieve?"
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neo-text mb-1">Description <span className="text-neo-muted font-normal">(optional)</span></label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="input resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neo-text mb-1">Target Date <span className="text-neo-muted font-normal">(optional)</span></label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="input"
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" onClick={resetForm}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingGoal ? 'Save' : 'Create Goal'}</Button>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}
