export interface User {
  id: string
  email: string
  name: string
  createdAt: string
}

export interface Task {
  id: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  dueDate?: string
  categoryId?: string
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly'
  recurrenceEndDate?: string
  goalId?: string
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  color: string
  icon: string
  createdAt: string
}

export interface Habit {
  id: string
  name: string
  frequency: 'daily' | 'specific'
  specificDays: string[] | null
  category: string
  goalId?: string
  createdAt: string
  completions: string[]   // last 7 days of completed dates ('YYYY-MM-DD')
}

export interface Goal {
  id: string
  title: string
  description?: string
  targetDate?: string
  status: 'active' | 'completed' | 'abandoned'
  progress: number
  createdAt: string
  updatedAt: string
  stats?: {
    totalTasks: number
    completedTasks: number
    totalHabits: number
  }
}

export interface Mood {
  id: string
  mood: number
  energy: number
  note?: string
  date: string
  createdAt: string
}

export interface FocusSession {
  id: string
  taskId?: string
  duration: number
  type: 'focus' | 'break'
  completed: number
  startedAt: string
  endedAt?: string
}

export interface Sound {
  id: string
  name: string
  icon: string
  url: string
}

export interface ApiResponse<T> {
  data: T
  meta?: {
    total: number
    page: number
    limit: number
  }
}

export interface ApiError {
  error: string
  details?: string[]
}
