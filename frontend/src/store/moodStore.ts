import { create } from 'zustand'
import type { Mood } from '../types'
import apiClient from '../api/client'

interface MoodState {
  moods: Mood[]
  todayMood: Mood | null
  stats: { avgMood: number; avgEnergy: number; minMood: number; maxMood: number; entries: number }
  isLoading: boolean
  error: string | null
  fetchMoods: (startDate: string, endDate: string) => Promise<void>
  fetchTodayMood: () => Promise<void>
  fetchStats: (days?: number) => Promise<void>
  saveMood: (data: { mood: number; energy: number; note?: string; date: string }) => Promise<void>
}

export const useMoodStore = create<MoodState>((set) => ({
  moods: [],
  todayMood: null,
  stats: { avgMood: 0, avgEnergy: 0, minMood: 0, maxMood: 0, entries: 0 },
  isLoading: false,
  error: null,

  fetchMoods: async (startDate, endDate) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.get('/moods', { params: { startDate, endDate } })
      const moods = response.data.data.map((m: any) => ({
        id: m.id, mood: m.mood, energy: m.energy, note: m.note, date: m.date, createdAt: m.created_at,
      }))
      set({ moods, isLoading: false })
    } catch {
      set({ error: 'Failed to fetch moods', isLoading: false })
    }
  },

  fetchTodayMood: async () => {
    try {
      const response = await apiClient.get('/moods/today')
      const m = response.data.data
      if (m) {
        set({ todayMood: { id: m.id, mood: m.mood, energy: m.energy, note: m.note, date: m.date, createdAt: m.created_at } })
      } else {
        set({ todayMood: null })
      }
    } catch {
      // silent fail
    }
  },

  fetchStats: async (days = 30) => {
    try {
      const response = await apiClient.get('/moods/stats', { params: { days } })
      set({ stats: response.data.data })
    } catch {
      // silent fail
    }
  },

  saveMood: async (data) => {
    try {
      const response = await apiClient.post('/moods', data)
      const m = response.data.data
      const mood: Mood = { id: m.id, mood: m.mood, energy: m.energy, note: m.note, date: m.date, createdAt: m.created_at }
      set({ todayMood: mood })
    } catch {
      set({ error: 'Failed to save mood' })
    }
  },
}))
