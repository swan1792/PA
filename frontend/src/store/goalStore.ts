import { create } from 'zustand'
import type { Goal } from '../types'
import apiClient from '../api/client'

interface GoalState {
  goals: Goal[]
  isLoading: boolean
  error: string | null
  fetchGoals: () => Promise<void>
  addGoal: (goal: { title: string; description?: string; targetDate?: string }) => Promise<void>
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>
  deleteGoal: (id: string) => Promise<void>
}

export const useGoalStore = create<GoalState>((set, get) => ({
  goals: [],
  isLoading: false,
  error: null,

  fetchGoals: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.get('/goals')
      const goals = response.data.data.map((g: any) => ({
        id: g.id,
        title: g.title,
        description: g.description,
        targetDate: g.target_date,
        status: g.status,
        progress: g.progress,
        createdAt: g.created_at,
        updatedAt: g.updated_at,
        stats: g.stats,
      }))
      set({ goals, isLoading: false })
    } catch {
      set({ error: 'Failed to fetch goals', isLoading: false })
    }
  },

  addGoal: async (data) => {
    try {
      const response = await apiClient.post('/goals', {
        title: data.title,
        description: data.description,
        targetDate: data.targetDate,
      })
      const g = response.data.data
      set({
        goals: [
          {
            id: g.id, title: g.title, description: g.description,
            targetDate: g.target_date, status: g.status, progress: g.progress,
            createdAt: g.created_at, updatedAt: g.updated_at,
          },
          ...get().goals,
        ],
      })
    } catch {
      set({ error: 'Failed to create goal' })
    }
  },

  updateGoal: async (id, updates) => {
    try {
      const response = await apiClient.put(`/goals/${id}`, {
        title: updates.title,
        description: updates.description,
        targetDate: updates.targetDate,
        status: updates.status,
        progress: updates.progress,
      })
      const g = response.data.data
      set({
        goals: get().goals.map((goal) =>
          goal.id === id
            ? { ...goal, title: g.title, description: g.description, targetDate: g.target_date, status: g.status, progress: g.progress, updatedAt: g.updated_at }
            : goal
        ),
      })
    } catch {
      set({ error: 'Failed to update goal' })
    }
  },

  deleteGoal: async (id) => {
    try {
      await apiClient.delete(`/goals/${id}`)
      set({ goals: get().goals.filter((g) => g.id !== id) })
    } catch {
      set({ error: 'Failed to delete goal' })
    }
  },
}))
