import { create } from 'zustand'
import apiClient from '../api/client'

interface Idea { id: string; content: string; color: string; positionX: number; positionY: number; createdAt: string }

interface IdeaState {
  ideas: Idea[]; isLoading: boolean; error: string | null
  fetchIdeas: () => Promise<void>; addIdea: (data: { content: string; color?: string }) => Promise<void>
  updateIdea: (id: string, data: { content?: string; color?: string }) => Promise<void>; deleteIdea: (id: string) => Promise<void>
}

export const useIdeaStore = create<IdeaState>((set, get) => ({
  ideas: [], isLoading: false, error: null,
  fetchIdeas: async () => {
    set({ isLoading: true })
    try { const r = await apiClient.get('/ideas'); set({ ideas: r.data.data.map((i: any) => ({ id: i.id, content: i.content, color: i.color, positionX: i.position_x, positionY: i.position_y, createdAt: i.created_at })), isLoading: false }) } catch { set({ isLoading: false }) }
  },
  addIdea: async (data) => {
    try { const r = await apiClient.post('/ideas', data); const i = r.data.data; set({ ideas: [{ id: i.id, content: i.content, color: i.color, positionX: i.position_x, positionY: i.position_y, createdAt: i.created_at }, ...get().ideas] }) } catch {}
  },
  updateIdea: async (id, data) => {
    try { const r = await apiClient.put(`/ideas/${id}`, data); const i = r.data.data; set({ ideas: get().ideas.map(x => x.id === id ? { ...x, content: i.content, color: i.color } : x) }) } catch {}
  },
  deleteIdea: async (id) => {
    try { await apiClient.delete(`/ideas/${id}`); set({ ideas: get().ideas.filter(i => i.id !== id) }) } catch {}
  },
}))
