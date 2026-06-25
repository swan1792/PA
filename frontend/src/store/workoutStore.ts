import { create } from 'zustand'
import apiClient from '../api/client'

interface Workout { id: string; name: string; type: string; duration: number | null; notes: string | null; date: string; sets?: WorkoutSet[] }
interface WorkoutSet { id: string; exercise: string; reps: number | null; weight: number | null; duration: number | null }

interface WorkoutState {
  workouts: Workout[]; stats: { weekWorkouts: number }; isLoading: boolean; error: string | null
  fetchWorkouts: () => Promise<void>; fetchStats: () => Promise<void>; addWorkout: (data: { name: string; type?: string; duration?: number; notes?: string; date: string }) => Promise<void>
  addSet: (workoutId: string, data: { exercise: string; reps?: number; weight?: number; duration?: number }) => Promise<void>; deleteWorkout: (id: string) => Promise<void>
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  workouts: [], stats: { weekWorkouts: 0 }, isLoading: false, error: null,
  fetchWorkouts: async () => {
    set({ isLoading: true })
    try { const r = await apiClient.get('/workouts'); set({ workouts: r.data.data, isLoading: false }) } catch { set({ isLoading: false }) }
  },
  fetchStats: async () => {
    try { const r = await apiClient.get('/workouts/stats'); set({ stats: r.data.data }) } catch {}
  },
  addWorkout: async (data) => {
    try { const r = await apiClient.post('/workouts', data); set({ workouts: [r.data.data, ...get().workouts] }) } catch {}
  },
  addSet: async (workoutId, data) => {
    try { await apiClient.post(`/workouts/${workoutId}/sets`, data) } catch {}
  },
  deleteWorkout: async (id) => {
    try { await apiClient.delete(`/workouts/${id}`); set({ workouts: get().workouts.filter(w => w.id !== id) }) } catch {}
  },
}))
