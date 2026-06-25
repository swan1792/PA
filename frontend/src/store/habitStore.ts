import { create } from 'zustand'
import type { Habit } from '../types'
import apiClient from '../api/client'

interface HabitState {
  habits: Habit[]
  isLoading: boolean
  error: string | null
  fetchHabits: () => Promise<void>
  addHabit: (habit: { name: string; frequency: 'daily' | 'specific'; specificDays?: string[]; category?: string }) => Promise<void>
  toggleCompletion: (habitId: string, date: string) => Promise<void>
  deleteHabit: (id: string) => Promise<void>
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  isLoading: false,
  error: null,

  fetchHabits: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.get('/habits')
      const habits = response.data.data.map((h: any) => ({
        id: h.id,
        name: h.name,
        frequency: h.frequency,
        specificDays: h.specific_days,
        category: h.category,
        createdAt: h.created_at,
        completions: h.completions,
      }))
      set({ habits, isLoading: false })
    } catch (error: any) {
      set({ error: 'Failed to fetch habits', isLoading: false })
    }
  },

  addHabit: async (habitData) => {
    try {
      const response = await apiClient.post('/habits', {
        name: habitData.name,
        frequency: habitData.frequency,
        specificDays: habitData.specificDays,
        category: habitData.category,
      })
      const h = response.data.data
      const newHabit: Habit = {
        id: h.id,
        name: h.name,
        frequency: h.frequency,
        specificDays: h.specific_days,
        category: h.category,
        createdAt: h.created_at,
        completions: [],
      }
      set({ habits: [newHabit, ...get().habits] })
    } catch (error) {
      set({ error: 'Failed to create habit' })
    }
  },

  toggleCompletion: async (habitId, date) => {
    try {
      const response = await apiClient.post(`/habits/${habitId}/toggle`, { date })
      const { completed } = response.data.data

      set({
        habits: get().habits.map((h) => {
          if (h.id !== habitId) return h
          const completions = completed
            ? [...h.completions, date].sort()
            : h.completions.filter((d) => d !== date)
          return { ...h, completions }
        }),
      })
    } catch (error) {
      set({ error: 'Failed to toggle completion' })
    }
  },

  deleteHabit: async (id) => {
    try {
      await apiClient.delete(`/habits/${id}`)
      set({ habits: get().habits.filter((h) => h.id !== id) })
    } catch (error) {
      set({ error: 'Failed to delete habit' })
    }
  },
}))
