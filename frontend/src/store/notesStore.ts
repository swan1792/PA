import { create } from 'zustand'
import apiClient from '../api/client'

interface NotesState {
  content: string
  lastSaved: string | null
  isLoading: boolean
  isSaving: boolean
  error: string | null
  fetchNotes: () => Promise<void>
  updateContent: (content: string) => void
  saveNotes: () => Promise<void>
}

let saveTimeout: ReturnType<typeof setTimeout> | null = null

export const useNotesStore = create<NotesState>((set, get) => ({
  content: '',
  lastSaved: null,
  isLoading: false,
  isSaving: false,
  error: null,

  fetchNotes: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.get('/notes')
      set({
        content: response.data.data?.content || '',
        lastSaved: response.data.data?.updated_at || null,
        isLoading: false,
      })
    } catch {
      set({ isLoading: false })
      // Notes endpoint may not exist yet — fail silently
    }
  },

  updateContent: (content: string) => {
    set({ content })

    // Debounce: auto-save 1.5 seconds after the user stops typing
    if (saveTimeout) clearTimeout(saveTimeout)
    saveTimeout = setTimeout(() => {
      get().saveNotes()
    }, 1500)
  },

  saveNotes: async () => {
    const { content } = get()
    set({ isSaving: true, error: null })
    try {
      const response = await apiClient.put('/notes', { content })
      set({
        isSaving: false,
        lastSaved: response.data.data?.updated_at || new Date().toISOString(),
      })
    } catch {
      set({ isSaving: false, error: 'Failed to save notes' })
    }
  },
}))
