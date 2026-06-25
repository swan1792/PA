import { create } from 'zustand'
import apiClient from '../api/client'

interface Settings { theme: 'system' | 'light' | 'dark'; accentColor: string; hasPin: boolean }

interface SettingsState {
  settings: Settings; isLoading: boolean
  fetchSettings: () => Promise<void>; updateSettings: (data: { theme?: string; accent_color?: string }) => Promise<void>
  applyTheme: (theme: string) => void
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: { theme: 'system', accentColor: '#7c3aed', hasPin: false },
  isLoading: false,

  fetchSettings: async () => {
    try {
      const r = await apiClient.get('/settings')
      const s = r.data.data
      set({ settings: { theme: s.theme, accentColor: s.accent_color, hasPin: s.hasPin } })
      get().applyTheme(s.theme)
    } catch {}
  },

  updateSettings: async (data) => {
    try {
      await apiClient.put('/settings', data)
      if (data.theme) {
        set({ settings: { ...get().settings, theme: data.theme as any } })
        get().applyTheme(data.theme)
      }
      if (data.accent_color) set({ settings: { ...get().settings, accentColor: data.accent_color } })
    } catch {}
  },

  applyTheme: (theme: string) => {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    if (theme === 'dark') root.classList.add('dark')
    else if (theme === 'light') root.classList.remove('dark')
    else {
      // System
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) root.classList.add('dark')
      else root.classList.remove('dark')
    }
  },
}))
