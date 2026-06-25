import { create } from 'zustand'
import apiClient from '../api/client'

interface ReadingItem { id: string; title: string; url: string; description: string | null; isRead: boolean; createdAt: string }

interface ReadingState {
  items: ReadingItem[]; isLoading: boolean; error: string | null
  fetchItems: () => Promise<void>; addItem: (data: { title: string; url: string; description?: string }) => Promise<void>
  toggleRead: (id: string) => Promise<void>; deleteItem: (id: string) => Promise<void>
}

export const useReadingStore = create<ReadingState>((set, get) => ({
  items: [], isLoading: false, error: null,
  fetchItems: async () => {
    set({ isLoading: true })
    try { const r = await apiClient.get('/reading-list'); set({ items: r.data.data.map((i: any) => ({ id: i.id, title: i.title, url: i.url, description: i.description, isRead: !!i.is_read, createdAt: i.created_at })), isLoading: false }) } catch { set({ isLoading: false }) }
  },
  addItem: async (data) => {
    try { const r = await apiClient.post('/reading-list', data); const i = r.data.data; set({ items: [{ id: i.id, title: i.title, url: i.url, description: i.description, isRead: false, createdAt: i.created_at }, ...get().items] }) } catch {}
  },
  toggleRead: async (id) => {
    try { const r = await apiClient.post(`/reading-list/${id}/toggle`); const i = r.data.data; set({ items: get().items.map(x => x.id === id ? { ...x, isRead: !!i.is_read } : x) }) } catch {}
  },
  deleteItem: async (id) => {
    try { await apiClient.delete(`/reading-list/${id}`); set({ items: get().items.filter(i => i.id !== id) }) } catch {}
  },
}))
