import { create } from 'zustand'
import apiClient from '../api/client'

interface Reminder { id: string; title: string; time: string; days: string | null; isActive: boolean; createdAt: string }
interface ReminderState {
  reminders: Reminder[]; isLoading: boolean; error: string | null
  fetchReminders: () => Promise<void>; addReminder: (data: { title: string; time: string; days?: string; isActive?: boolean }) => Promise<void>
  updateReminder: (id: string, data: Partial<Reminder>) => Promise<void>; deleteReminder: (id: string) => Promise<void>
}

export const useReminderStore = create<ReminderState>((set, get) => ({
  reminders: [], isLoading: false, error: null,
  fetchReminders: async () => {
    set({ isLoading: true })
    try { const r = await apiClient.get('/reminders'); set({ reminders: r.data.data.map((r: any) => ({ id: r.id, title: r.title, time: r.time, days: r.days, isActive: !!r.is_active, createdAt: r.created_at })), isLoading: false }) } catch { set({ isLoading: false }) }
  },
  addReminder: async (data) => {
    try { const r = await apiClient.post('/reminders', data); const rem = r.data.data; set({ reminders: [...get().reminders, { id: rem.id, title: rem.title, time: rem.time, days: rem.days, isActive: rem.is_active, createdAt: '' }] }) } catch {}
  },
  updateReminder: async (id, data) => {
    try { await apiClient.put(`/reminders/${id}`, data); set({ reminders: get().reminders.map(r => r.id === id ? { ...r, ...data } : r) }) } catch {}
  },
  deleteReminder: async (id) => {
    try { await apiClient.delete(`/reminders/${id}`); set({ reminders: get().reminders.filter(r => r.id !== id) }) } catch {}
  },
}))
