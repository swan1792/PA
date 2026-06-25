import { create } from 'zustand'
import type { Sound } from '../types'
import apiClient from '../api/client'

interface SoundState {
  sounds: Sound[]
  activeSound: Sound | null
  isPlaying: boolean
  volume: number
  isLoading: boolean
  error: string | null
  fetchSounds: () => Promise<void>
  playSound: (sound: Sound) => void
  stopSound: () => void
  setVolume: (volume: number) => void
}

export const useSoundStore = create<SoundState>((set, get) => ({
  sounds: [],
  activeSound: null,
  isPlaying: false,
  volume: 0.5,
  isLoading: false,
  error: null,

  fetchSounds: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.get('/sounds')
      set({ sounds: response.data.data, isLoading: false })
    } catch {
      set({ error: 'Failed to fetch sounds', isLoading: false })
    }
  },

  playSound: (sound) => {
    const { activeSound, isPlaying } = get()
    if (activeSound?.id === sound.id && isPlaying) {
      set({ isPlaying: false })
    } else {
      set({ activeSound: sound, isPlaying: true })
    }
  },

  stopSound: () => {
    set({ isPlaying: false })
  },

  setVolume: (volume) => {
    set({ volume: Math.max(0, Math.min(1, volume)) })
  },
}))
