import { create } from 'zustand'
import type { Category } from '../types'
import apiClient from '../api/client'

interface CategoryState {
  categories: Category[]
  isLoading: boolean
  error: string | null
  fetchCategories: () => Promise<void>
  addCategory: (category: { name: string; color?: string; icon?: string }) => Promise<void>
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.get('/categories')
      const categories = response.data.data.map((c: any) => ({
        id: c.id,
        name: c.name,
        color: c.color,
        icon: c.icon,
        createdAt: c.created_at,
      }))
      set({ categories, isLoading: false })
    } catch {
      set({ error: 'Failed to fetch categories', isLoading: false })
    }
  },

  addCategory: async (data) => {
    try {
      const response = await apiClient.post('/categories', data)
      const c = response.data.data
      set({ categories: [...get().categories, { id: c.id, name: c.name, color: c.color, icon: c.icon, createdAt: c.created_at }] })
    } catch {
      set({ error: 'Failed to create category' })
    }
  },

  updateCategory: async (id, updates) => {
    try {
      const response = await apiClient.put(`/categories/${id}`, updates)
      const c = response.data.data
      set({
        categories: get().categories.map((cat) =>
          cat.id === id ? { ...cat, name: c.name, color: c.color, icon: c.icon } : cat
        ),
      })
    } catch {
      set({ error: 'Failed to update category' })
    }
  },

  deleteCategory: async (id) => {
    try {
      await apiClient.delete(`/categories/${id}`)
      set({ categories: get().categories.filter((c) => c.id !== id) })
    } catch {
      set({ error: 'Failed to delete category' })
    }
  },
}))
