import { create } from 'zustand'
import type { Budget } from '../types'
import apiClient from '../api/client'

interface BudgetState {
  budgets: Budget[]
  month: string
  isLoading: boolean
  error: string | null
  fetchBudgets: (month?: string) => Promise<void>
  upsertBudget: (category: string, month: string, amount: number) => Promise<void>
  deleteBudget: (id: string) => Promise<void>
  setMonth: (month: string) => void
}

function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7)
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
  budgets: [],
  month: getCurrentMonth(),
  isLoading: false,
  error: null,

  fetchBudgets: async (month?) => {
    set({ isLoading: true, error: null })
    try {
      const m = month || get().month
      const response = await apiClient.get(`/budgets?month=${m}`)
      set({ budgets: response.data.data, isLoading: false, month: m })
    } catch {
      set({ error: 'Failed to fetch budgets', isLoading: false })
    }
  },

  upsertBudget: async (category, month, amount) => {
    try {
      await apiClient.post('/budgets', { category, month, amount })
      // Re-fetch to get spending-enriched data (spent, remaining, percentUsed)
      const response = await apiClient.get(`/budgets?month=${month}`)
      set({ budgets: response.data.data, error: null })
    } catch {
      set({ error: 'Failed to save budget' })
    }
  },

  deleteBudget: async (id) => {
    try {
      await apiClient.delete(`/budgets/${id}`)
      const response = await apiClient.get(`/budgets?month=${get().month}`)
      set({ budgets: response.data.data, error: null })
    } catch {
      set({ error: 'Failed to delete budget' })
    }
  },

  setMonth: (month) => {
    set({ month })
  },
}))
