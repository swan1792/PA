import { useEffect, useState } from 'react'
import { useExpenseStore, EXPENSE_CATEGORIES } from '../store/expenseStore'
import { useBudgetStore } from '../store/budgetStore'
import Layout from '../components/layout/Layout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { clsx } from 'clsx'

export default function ExpensePage() {
  const { expenses, stats, fetchExpenses, fetchStats, addExpense, deleteExpense, isLoading, error: expenseError } = useExpenseStore()
  const { budgets, month, fetchBudgets, upsertBudget, deleteBudget, setMonth, error: budgetError } = useBudgetStore()
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false)
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false)
  const [editBudgetCategory, setEditBudgetCategory] = useState('')
  const [editBudgetAmount, setEditBudgetAmount] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('🍔 Food')
  const [description, setDescription] = useState('')

  const statMonth = (m: string) => {
    const [y, mon] = m.split('-').map(Number)
    const start = `${m}-01`
    const end = new Date(y, mon, 1).toISOString().split('T')[0]
    return { startDate: start, endDate: end }
  }

  useEffect(() => { fetchExpenses(); fetchStats() }, [])
  useEffect(() => { fetchBudgets(month) }, [month])
  useEffect(() => {
    // Sync stats with selected month
    const [y, m] = month.split('-').map(Number)
    const startDate = `${month}-01`
    const endDateObj = new Date(y, m, 1)
    const endDate = endDateObj.toISOString().split('T')[0]
    fetchStats(startDate, endDate)
  }, [month])

  const handleAddExpense = async () => {
    if (!amount || parseFloat(amount) <= 0) return
    const today = new Date().toISOString().split('T')[0]
    await addExpense({ amount: parseFloat(amount), category, description: description || undefined, date: today })
    setAmount(''); setDescription(''); setIsExpenseModalOpen(false)
    const { startDate, endDate } = statMonth(month)
    fetchStats(startDate, endDate)
    fetchBudgets(month)
  }

  const openBudgetModal = (cat: string = '') => {
    const existing = budgets.find(b => b.category === cat)
    setEditBudgetCategory(cat)
    setEditBudgetAmount(existing ? String(existing.amount) : '')
    setIsBudgetModalOpen(true)
  }

  const handleSaveBudget = async () => {
    if (!editBudgetAmount || parseFloat(editBudgetAmount) <= 0) return
    await upsertBudget(editBudgetCategory, month, parseFloat(editBudgetAmount))
    setIsBudgetModalOpen(false)
    fetchBudgets(month)
  }

  const handleDeleteBudget = async (id: string) => {
    await deleteBudget(id)
    fetchBudgets(month)
  }

  const changeMonth = (delta: number) => {
    const [y, m] = month.split('-').map(Number)
    const d = new Date(y, m - 1 + delta, 1)
    setMonth(d.toISOString().slice(0, 7))
  }

  const monthLabel = new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const isCurrentMonth = month === new Date().toISOString().slice(0, 7)

  const totalBudget = budgets.find(b => b.category === '')
  const categoryBudgets = budgets.filter(b => b.category !== '')

  const progressColor = (percent: number) => {
    if (percent >= 100) return 'bg-red-500'
    if (percent >= 80) return 'bg-amber-500'
    return 'bg-emerald-500'
  }

  const progressTrackColor = (percent: number) => {
    if (percent >= 100) return 'bg-red-100 dark:bg-red-900/30'
    if (percent >= 80) return 'bg-amber-100 dark:bg-amber-900/30'
    return 'bg-gray-100 dark:bg-gray-700'
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="page-header">
          <div className="page-header-row">
            <div>
              <h1>💰 Expenses</h1>
              <p>Track your spending and budgets</p>
            </div>
            <Button onClick={() => setIsExpenseModalOpen(true)}>Add Expense</Button>
          </div>
        </div>

        {/* Error banners */}
        {(budgetError || expenseError) && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
            {budgetError && <p>💰 Budget: {budgetError}</p>}
            {expenseError && <p>💸 Expenses: {expenseError}</p>}
          </div>
        )}

        {/* Month Navigation + Budget Overview */}
        <Card padding="md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button onClick={() => changeMonth(-1)} className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-neo-text">←</button>
              <h2 className="text-base font-semibold text-neo-text">{monthLabel}</h2>
              <button onClick={() => changeMonth(1)} className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-neo-text">→</button>
              {!isCurrentMonth && (
                <button onClick={() => setMonth(new Date().toISOString().slice(0, 7))} className="text-xs text-neo-primary hover:underline">Back to today</button>
              )}
            </div>
            <Button variant="secondary" size="sm" onClick={() => openBudgetModal('')}>
              Set Budget
            </Button>
          </div>

          {/* Overall Budget */}
          {totalBudget && (
            <div className="mb-5 p-4 rounded-xl bg-gray-50 dark:bg-[#1a1a2a]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-neo-text">Total Budget</span>
                <div className="flex items-center gap-2">
                  <span className={clsx(
                    'text-sm font-bold',
                    (totalBudget.percentUsed ?? 0) >= 100 ? 'text-red-500' : (totalBudget.percentUsed ?? 0) >= 80 ? 'text-amber-500' : 'text-neo-text'
                  )}>
                    ${(totalBudget.spent ?? 0).toFixed(2)} / ${totalBudget.amount.toFixed(2)}
                  </span>
                  <button onClick={() => handleDeleteBudget(totalBudget.id)} className="text-xs text-neo-muted hover:text-neo-danger transition-colors" title="Remove budget">✕</button>
                </div>
              </div>
              <div className={clsx('w-full h-2.5 rounded-full', progressTrackColor(totalBudget.percentUsed ?? 0))}>
                <div className={clsx('h-full rounded-full transition-all duration-500', progressColor(totalBudget.percentUsed ?? 0))}
                  style={{ width: `${Math.min(totalBudget.percentUsed ?? 0, 100)}%` }} />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-neo-muted">{(totalBudget.percentUsed ?? 0)}% used</span>
                {(totalBudget.remaining ?? 0) >= 0
                  ? <span className="text-xs text-emerald-600 dark:text-emerald-400">${(totalBudget.remaining ?? 0).toFixed(2)} left</span>
                  : <span className="text-xs text-red-500 font-medium">${Math.abs(totalBudget.remaining ?? 0).toFixed(2)} over budget!</span>
                }
              </div>
            </div>
          )}

          {/* Per-category Budgets */}
          {categoryBudgets.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neo-muted uppercase tracking-wider">Category Budgets</span>
                <button onClick={() => openBudgetModal('')} className="text-xs text-neo-primary hover:underline">+ Add category budget</button>
              </div>
              {categoryBudgets.map(b => {
                const catIcon = b.category.split(' ')[0] || '💸'
                return (
                  <div key={b.id} className="flex items-center gap-3">
                    <span className="text-base flex-shrink-0 w-6 text-center">{catIcon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-neo-text truncate">{b.category}</span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={clsx(
                            'text-xs font-medium',
                            (b.percentUsed ?? 0) >= 100 ? 'text-red-500' : (b.percentUsed ?? 0) >= 80 ? 'text-amber-500' : 'text-neo-muted'
                          )}>
                            ${(b.spent ?? 0).toFixed(0)} / ${b.amount.toFixed(0)}
                          </span>
                          <button onClick={() => openBudgetModal(b.category)} className="text-xs text-neo-muted hover:text-neo-primary transition-colors">✎</button>
                          <button onClick={() => handleDeleteBudget(b.id)} className="text-xs text-neo-muted hover:text-neo-danger transition-colors">✕</button>
                        </div>
                      </div>
                      <div className={clsx('w-full h-2 rounded-full', progressTrackColor(b.percentUsed ?? 0))}>
                        <div className={clsx('h-full rounded-full transition-all duration-500', progressColor(b.percentUsed ?? 0))}
                          style={{ width: `${Math.min(b.percentUsed ?? 0, 100)}%` }} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* No budgets set */}
          {!totalBudget && categoryBudgets.length === 0 && (
            <div className="text-center py-3">
              <p className="text-sm text-neo-muted">No budgets set for this month.</p>
              <button onClick={() => openBudgetModal('')} className="mt-2 text-sm text-neo-primary hover:underline">Set a monthly budget</button>
            </div>
          )}
        </Card>

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
                        <div className="h-full bg-neo-primary rounded-full" style={{ width: `${stats.total > 0 ? (c.total / stats.total) * 100 : 0}%` }} />
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
                <button onClick={() => { deleteExpense(e.id); const { startDate, endDate } = statMonth(month); fetchStats(startDate, endDate); fetchBudgets(month) }} className="text-xs text-neo-muted hover:text-neo-danger w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0">✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      <Modal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} title="Add Expense" size="sm">
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
            <Button variant="secondary" onClick={() => setIsExpenseModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddExpense}>Add Expense</Button>
          </div>
        </div>
      </Modal>

      {/* Budget Modal */}
      <Modal isOpen={isBudgetModalOpen} onClose={() => setIsBudgetModalOpen(false)} title={editBudgetCategory ? `Budget for ${editBudgetCategory}` : 'Set Monthly Budget'} size="sm">
        <div className="space-y-4">
          {!editBudgetCategory && (
            <div>
              <label className="block text-sm font-medium text-neo-text mb-1.5">Category</label>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => setEditBudgetCategory('')} className={editBudgetCategory === '' ? 'pill-active' : 'pill-inactive'}>📊 Overall</button>
                {EXPENSE_CATEGORIES.map(c => (
                  <button key={c} onClick={() => setEditBudgetCategory(c)} className={editBudgetCategory === c ? 'pill-active' : 'pill-inactive'}>{c}</button>
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-neo-text mb-1">
              {editBudgetCategory ? `Monthly Limit for ${editBudgetCategory} ($)` : 'Total Monthly Limit ($)'}
            </label>
            <input value={editBudgetAmount} onChange={e => setEditBudgetAmount(e.target.value)} placeholder="0.00" type="number" step="0.01" className="input text-lg" />
          </div>
          <p className="text-xs text-neo-muted">Budget for {monthLabel}</p>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" onClick={() => setIsBudgetModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveBudget}>Save Budget</Button>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}
