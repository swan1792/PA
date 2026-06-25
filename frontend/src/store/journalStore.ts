import { create } from 'zustand'
import apiClient from '../api/client'

interface Journal { id: string; title: string | null; content: string; mood: number | null; date: string; createdAt: string }

interface JournalState {
  journals: Journal[]; isLoading: boolean; error: string | null
  fetchJournals: () => Promise<void>; addJournal: (data: { title?: string; content: string; mood?: number; date: string }) => Promise<void>
  updateJournal: (id: string, data: { title?: string; content?: string; mood?: number }) => Promise<void>; deleteJournal: (id: string) => Promise<void>
}

export const useJournalStore = create<JournalState>((set, get) => ({
  journals: [], isLoading: false, error: null,
  fetchJournals: async () => {
    set({ isLoading: true })
    try { const r = await apiClient.get('/journals'); set({ journals: r.data.data.map((j: any) => ({ id: j.id, title: j.title, content: j.content, mood: j.mood, date: j.date, createdAt: j.created_at })), isLoading: false }) } catch { set({ isLoading: false }) }
  },
  addJournal: async (data) => {
    try { const r = await apiClient.post('/journals', data); const j = r.data.data; set({ journals: [{ id: j.id, title: j.title, content: j.content, mood: j.mood, date: j.date, createdAt: j.created_at }, ...get().journals] }) } catch { set({ error: 'Failed' }) }
  },
  updateJournal: async (id, data) => {
    try { const r = await apiClient.put(`/journals/${id}`, data); const j = r.data.data; set({ journals: get().journals.map(x => x.id === id ? { ...x, title: j.title, content: j.content, mood: j.mood } : x) }) } catch {}
  },
  deleteJournal: async (id) => {
    try { await apiClient.delete(`/journals/${id}`); set({ journals: get().journals.filter(j => j.id !== id) }) } catch {}
  },
}))
