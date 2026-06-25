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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">💰 Expenses</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Track your spending</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>Add Expense</Button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">This Month</h3>
              <p className="text-3xl font-bold text-brand-600">${stats.total.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-1">Total spent</p>
            </Card>
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">By Category</h3>
              <div className="space-y-2">
                {stats.categories.slice(0, 5).map(c => (
                  <div key={c.category} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{c.category}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-500 rounded-full" style={{ width: `${(c.total / stats.total) * 100}%` }} />
                      </div>
                      <span className="text-sm font-medium w-16 text-right">${c.total.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Expense List */}
        {isLoading ? <div className="animate-pulse space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl" />)}</div>
        : expenses.length === 0 ? <div className="text-center py-12"><p className="text-4xl mb-4">💸</p><p className="text-gray-500">No expenses yet</p></div>
        : (
          <div className="space-y-2">
            {expenses.map(e => (
              <Card key={e.id} padding="sm" className="flex items-center gap-4">
                <span className="text-xl">{e.category.split(' ')[0]}</span>
                <div className="flex-1">
                  <span className="font-medium text-gray-900 dark:text-white">{e.category}</span>
                  {e.description && <span className="text-sm text-gray-500 ml-2">— {e.description}</span>}
                </div>
                <span className="text-sm text-gray-500">{new Date(e.date).toLocaleDateString()}</span>
                <span className="font-semibold text-gray-900 dark:text-white">${e.amount.toFixed(2)}</span>
                <button onClick={() => { deleteExpense(e.id); fetchStats() }} className="text-gray-400 hover:text-red-500 text-sm">✕</button>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Expense" size="sm">
        <div className="space-y-4">
          <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount ($)" type="number" step="0.01" className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-lg" />
          <div className="flex gap-2 flex-wrap">
            {EXPENSE_CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1.5 rounded-lg text-sm ${category === c ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>{c}</button>
            ))}
          </div>
          <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description (optional)" className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800" />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Add</Button>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}
