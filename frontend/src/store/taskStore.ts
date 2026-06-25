import { create } from 'zustand'
import type { Task } from '../types'
import apiClient from '../api/client'

interface TaskState {
  tasks: Task[]
  isLoading: boolean
  error: string | null
  fetchTasks: () => Promise<void>
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  fetchTasks: () => Promise<void>
  deleteTask: (id: string) => Promise<void>
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,

  fetchTasks: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.get('/tasks')
      const tasks = response.data.data.map((t: any) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        dueDate: t.due_date,
        categoryId: t.category_id,
        recurrence: t.recurrence || 'none',
        recurrenceEndDate: t.recurrence_end_date,
        goalId: t.goal_id,
        createdAt: t.created_at,
        updatedAt: t.updated_at,
      }))
      set({ tasks, isLoading: false })
    } catch (error: any) {
      set({ error: 'Failed to fetch tasks', isLoading: false })
    }
  },

  addTask: async (taskData) => {
    try {
      const response = await apiClient.post('/tasks', {
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        dueDate: taskData.dueDate,
        categoryId: taskData.categoryId,
        recurrence: taskData.recurrence,
        recurrenceEndDate: taskData.recurrenceEndDate,
        goalId: taskData.goalId,
      })
      const d = response.data.data
      const newTask = {
        id: d.id, title: d.title, description: d.description, status: d.status,
        priority: d.priority, dueDate: d.due_date, categoryId: d.category_id,
        recurrence: d.recurrence || 'none', recurrenceEndDate: d.recurrence_end_date,
        goalId: d.goal_id, createdAt: d.created_at, updatedAt: d.updated_at,
      }
      set({ tasks: [newTask, ...get().tasks] })
    } catch (error) {
      set({ error: 'Failed to create task' })
    }
  },

  updateTask: async (id, updates) => {
    try {
      const response = await apiClient.put(`/tasks/${id}`, {
        title: updates.title,
        description: updates.description,
        status: updates.status,
        priority: updates.priority,
        dueDate: updates.dueDate,
        categoryId: updates.categoryId,
        recurrence: updates.recurrence,
        recurrenceEndDate: updates.recurrenceEndDate,
        goalId: updates.goalId,
      })
      const d = response.data.data
      const updatedTask = {
        id: d.id, title: d.title, description: d.description, status: d.status,
        priority: d.priority, dueDate: d.due_date, categoryId: d.category_id,
        recurrence: d.recurrence || 'none', recurrenceEndDate: d.recurrence_end_date,
        goalId: d.goal_id, createdAt: d.created_at, updatedAt: d.updated_at,
      }
      set({
        tasks: get().tasks.map((t) => (t.id === id ? updatedTask : t)),
      })
    } catch (error) {
      set({ error: 'Failed to update task' })
    }
  },

  deleteTask: async (id) => {
    try {
      await apiClient.delete(`/tasks/${id}`)
      set({ tasks: get().tasks.filter((t) => t.id !== id) })
    } catch (error) {
      set({ error: 'Failed to delete task' })
    }
  },
}))
