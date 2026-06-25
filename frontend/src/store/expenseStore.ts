import { create } from 'zustand'
import apiClient from '../api/client'

interface Expense { id: string; amount: number; category: string; description: string | null; date: string; createdAt: string }
interface ExpenseStats { total: number; categories: { category: string; total: number; count: number }[] }

const EXPENSE_CATEGORIES = ['🍔 Food', '🚌 Transport', '🛒 Shopping', '🏠 Housing', '💊 Health', '🎮 Entertainment', '📚 Education', '💼 Business', '🎁 Gifts', '📱 Bills', '✈️ Travel', '❓ Other']

interface ExpenseState {
  expenses: Expense[]; stats: ExpenseStats | null; isLoading: boolean; error: string | null
  fetchExpenses: () => Promise<void>; fetchStats: (startDate?: string, endDate?: string) => Promise<void>
  addExpense: (data: { amount: number; category: string; description?: string; date: string }) => Promise<void>; deleteExpense: (id: string) => Promise<void>
}

export { EXPENSE_CATEGORIES }
export const useExpenseStore = create<ExpenseState>((set, get) => ({
  expenses: [], stats: null, isLoading: false, error: null,
  fetchExpenses: async () => {
    set({ isLoading: true })
    try { const r = await apiClient.get('/expenses'); set({ expenses: r.data.data.map((e: any) => ({ id: e.id, amount: e.amount, category: e.category, description: e.description, date: e.date, createdAt: e.created_at })), isLoading: false }) } catch { set({ isLoading: false }) }
  },
  fetchStats: async (startDate?, endDate?) => {
    try { const r = await apiClient.get('/expenses/stats', { params: { startDate, endDate } }); set({ stats: r.data.data }) } catch {}
  },
  addExpense: async (data) => {
    try { const r = await apiClient.post('/expenses', data); const e = r.data.data; set({ expenses: [{ id: e.id, amount: e.amount, category: e.category, description: e.description, date: e.date, createdAt: e.created_at }, ...get().expenses] }) } catch {}
  },
  deleteExpense: async (id) => {
    try { await apiClient.delete(`/expenses/${id}`); set({ expenses: get().expenses.filter(e => e.id !== id) }) } catch {}
  },
}))
