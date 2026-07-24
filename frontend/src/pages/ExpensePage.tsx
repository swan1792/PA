import { useEffect, useState } from 'react'
import { useExpenseStore, EXPENSE_CATEGORIES } from '../store/expenseStore'
import Layout from '../components/layout/Layout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'

export default function ExpensePage() {
  const { expenses, stats, fetchExpenses, fetchStats, addExpense, deleteExpense, isLoading } = useExpenseStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('🍔 Food')
  const [description, setDescription] = useState('')

  useEffect(() => { fetchExpenses(); fetchStats() }, [])

  const handleAdd = async () => {
    if (!amount || parseFloat(amount) <= 0) return
    const today = new Date().toISOString().split('T')[0]
    await addExpense({ amount: parseFloat(amount), category, description: description || undefined, date: today })
    setAmount(''); setDescription(''); setIsModalOpen(false)
    fetchStats()
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="page-header">
          <div className="page-header-row">
            <div>
              <h1>💰 Expenses</h1>
              <p>Track your spending</p>
            </div>
            <Button onClick={() => setIsModalOpen(true)}>Add Expense</Button>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Card>
              <p className="text-xs text-neo-muted mb-1">This Month</p>
              <p className="text-2xl font-bold text-neo-primary">${stats.total.toFixed(2)}</p>
              <p className="text-xs text-neo-textSecondary mt-1">Total spent</p>
            </Card>
            <Card>
              <p className="text-sm font-semibold text-neo-text mb-3">By Category</p>
              <div className="space-y-2">
                {stats.categories.slice(0, 5).map(c => (
                  <div key={c.category} className="flex items-center justify-between">
                    <span className="text-sm text-neo-textSecondary">{c.category}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-1.5 bg-gray-100 dark:bg-[#2a2a40] rounded-full overflow-hidden">
                        <div className="h-full bg-neo-primary rounded-full" style={{ width: `${(c.total / stats.total) * 100}%` }} />
                      </div>
                      <span className="text-sm font-medium text-neo-text w-16 text-right">${c.total.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Expense List */}
        {isLoading ? <div className="animate-pulse space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-14 bg-gray-100 dark:bg-[#2a2a40] rounded-xl" />)}</div>
        : expenses.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-[#2a2a40] flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💸</span>
            </div>
            <p className="text-neo-textSecondary text-sm">No expenses yet</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {expenses.map(e => (
              <div key={e.id} className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-[#252538] transition-colors">
                <span className="text-lg flex-shrink-0">{e.category.split(' ')[0]}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-neo-text">{e.category}</span>
                  {e.description && <span className="text-sm text-neo-muted ml-1.5">— {e.description}</span>}
                </div>
                <span className="text-xs text-neo-muted flex-shrink-0">{new Date(e.date).toLocaleDateString()}</span>
                <span className="text-sm font-semibold text-neo-text w-20 text-right flex-shrink-0">${e.amount.toFixed(2)}</span>
                <button onClick={() => { deleteExpense(e.id); fetchStats() }} className="text-xs text-neo-muted hover:text-neo-danger w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0">✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Expense" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neo-text mb-1">Amount ($)</label>
            <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" type="number" step="0.01" className="input text-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neo-text mb-1.5">Category</label>
            <div className="flex gap-2 flex-wrap">
              {EXPENSE_CATEGORIES.map(c => (
                <button key={c} onClick={() => setCategory(c)} className={category === c ? 'pill-active' : 'pill-inactive'}>{c}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neo-text mb-1">Description <span className="text-neo-muted font-normal">(optional)</span></label>
            <input value={description} onChange={e => setDescription(e.target.value)} placeholder="What was it for?" className="input" />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Add Expense</Button>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}
