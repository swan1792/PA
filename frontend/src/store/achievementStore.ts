import { create } from 'zustand'
import apiClient from '../api/client'

interface Achievement { id: string; name: string; description: string; icon: string; conditionType: string; conditionValue: number; earned: boolean }
interface AchievementState {
  achievements: Achievement[]; isLoading: boolean; error: string | null
  fetchAchievements: () => Promise<void>; checkAchievements: () => Promise<string[]>
}

export const useAchievementStore = create<AchievementState>((set) => ({
  achievements: [], isLoading: false, error: null,
  fetchAchievements: async () => {
    set({ isLoading: true })
    try {
      const r = await apiClient.get('/achievements')
      set({ achievements: r.data.data.map((a: any) => ({ id: a.id, name: a.name, description: a.description, icon: a.icon, conditionType: a.condition_type, conditionValue: a.condition_value, earned: a.earned })), isLoading: false })
    } catch { set({ isLoading: false }) }
  },
  checkAchievements: async () => {
    try {
      const r = await apiClient.post('/achievements/check')
      const newlyEarned = r.data.data as any[]
      if (newlyEarned.length > 0) {
        set({ achievements: (await apiClient.get('/achievements')).data.data.map((a: any) => ({ id: a.id, name: a.name, description: a.description, icon: a.icon, conditionType: a.condition_type, conditionValue: a.condition_value, earned: a.earned })) })
      }
      return newlyEarned.map(a => a.name)
    } catch { return [] }
  },
}))
