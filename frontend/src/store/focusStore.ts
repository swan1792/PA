import { create } from 'zustand'
import type { FocusSession } from '../types'
import apiClient from '../api/client'

interface FocusState {
  sessions: FocusSession[]
  todaySessions: FocusSession[]
  stats: {
    today: { sessions: number; minutes: number }
    total: { sessions: number; minutes: number }
  }
  activeSession: FocusSession | null
  isLoading: boolean
  error: string | null
  fetchSessions: () => Promise<void>
  fetchTodaySessions: () => Promise<void>
  fetchStats: () => Promise<void>
  startSession: (data?: { taskId?: string; duration?: number; type?: 'focus' | 'break' }) => Promise<void>
  completeSession: (id: string) => Promise<void>
  clearActiveSession: () => void
}

export const useFocusStore = create<FocusState>((set, get) => ({
  sessions: [],
  todaySessions: [],
  stats: { today: { sessions: 0, minutes: 0 }, total: { sessions: 0, minutes: 0 } },
  activeSession: null,
  isLoading: false,
  error: null,

  fetchSessions: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.get('/focus-sessions')
      const sessions = response.data.data.map((s: any) => ({
        id: s.id, taskId: s.task_id, duration: s.duration, type: s.type,
        completed: s.completed, startedAt: s.started_at, endedAt: s.ended_at,
      }))
      set({ sessions, isLoading: false })
    } catch {
      set({ error: 'Failed to fetch sessions', isLoading: false })
    }
  },

  fetchTodaySessions: async () => {
    try {
      const response = await apiClient.get('/focus-sessions/today')
      const sessions = response.data.data.map((s: any) => ({
        id: s.id, taskId: s.task_id, duration: s.duration, type: s.type,
        completed: s.completed, startedAt: s.started_at, endedAt: s.ended_at,
      }))
      set({ todaySessions: sessions })
    } catch {
      // silent fail
    }
  },

  fetchStats: async () => {
    try {
      const response = await apiClient.get('/focus-sessions/stats')
      set({ stats: response.data.data })
    } catch {
      // silent fail
    }
  },

  startSession: async (data = {}) => {
    try {
      const response = await apiClient.post('/focus-sessions', {
        taskId: data.taskId,
        duration: data.duration || 25,
        type: data.type || 'focus',
      })
      const s = response.data.data
      const session: FocusSession = {
        id: s.id, taskId: s.task_id, duration: s.duration, type: s.type,
        completed: s.completed, startedAt: s.started_at, endedAt: s.ended_at,
      }
      set({ activeSession: session, todaySessions: [session, ...get().todaySessions] })
    } catch {
      set({ error: 'Failed to start session' })
    }
  },

  completeSession: async (id) => {
    try {
      const response = await apiClient.post(`/focus-sessions/${id}/complete`)
      const s = response.data.data
      const session: FocusSession = {
        id: s.id, taskId: s.task_id, duration: s.duration, type: s.type,
        completed: s.completed, startedAt: s.started_at, endedAt: s.ended_at,
      }
      set({
        activeSession: null,
        todaySessions: get().todaySessions.map((ts) => (ts.id === id ? session : ts)),
      })
      get().fetchStats()
    } catch {
      set({ error: 'Failed to complete session' })
    }
  },

  clearActiveSession: () => set({ activeSession: null }),
}))
