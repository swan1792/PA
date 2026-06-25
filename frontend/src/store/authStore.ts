import { create } from 'zustand'
import type { User } from '../types'
import apiClient from '../api/client'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  googleLogin: (idToken: string) => Promise<void>
  logout: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.post('/auth/login', { email, password })
      const { user, token } = response.data.data

      localStorage.setItem('token', token)
      set({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: new Date().toISOString(),
        },
        token,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error: any) {
      const message = error.response?.data?.error || 'Login failed'
      set({ error: message, isLoading: false })
      throw new Error(message)
    }
  },

  register: async (name: string, email: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.post('/auth/register', { name, email, password })
      const { user, token } = response.data.data

      localStorage.setItem('token', token)
      set({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: new Date().toISOString(),
        },
        token,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error: any) {
      const message = error.response?.data?.error || 'Registration failed'
      set({ error: message, isLoading: false })
      throw new Error(message)
    }
  },

  googleLogin: async (idToken: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.post('/auth/google/web', { credential: idToken })
      const { user, token } = response.data.data

      localStorage.setItem('token', token)
      set({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: new Date().toISOString(),
        },
        token,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error: any) {
      const message = error.response?.data?.error || 'Google login failed'
      set({ error: message, isLoading: false })
      throw new Error(message)
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null, isAuthenticated: false, error: null })
  },

  clearError: () => {
    set({ error: null })
  },
}))
