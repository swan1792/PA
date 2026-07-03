import { getDB } from '../db'

export interface Task {
  id: string
  user_id: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  due_date?: string
  category_id?: string
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly'
  recurrence_end_date?: string
  parent_task_id?: string
  goal_id?: string
  created_at: string
  updated_at: string
}

function mapTask(row: any): Task {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    title: row.title as string,
    description: row.description as string | undefined,
    status: row.status as Task['status'],
    priority: row.priority as Task['priority'],
    due_date: row.due_date as string | undefined,
    category_id: row.category_id as string | undefined,
    recurrence: (row.recurrence as Task['recurrence']) || 'none',
    recurrence_end_date: row.recurrence_end_date as string | undefined,
    parent_task_id: row.parent_task_id as string | undefined,
    goal_id: row.goal_id as string | undefined,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  }
}

export const TaskModel = {
  async findAll(userId: string): Promise<Task[]> {
    const db = getDB()
    const result = await db.execute({
      sql: 'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC',
      args: [userId]
    })
    return result.rows.map(mapTask)
  },

  async findById(id: string, userId: string): Promise<Task | undefined> {
    const db = getDB()
    const result = await db.execute({
      sql: 'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
      args: [id, userId]
    })
    if (result.rows.length === 0) return undefined
    return mapTask(result.rows[0])
  },

  async create(data: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    const db = getDB()
    const id = crypto.randomUUID()
    await db.execute({
      sql: 'INSERT INTO tasks (id, user_id, title, description, status, priority, due_date, category_id, recurrence, recurrence_end_date, parent_task_id, goal_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      args: [id, data.user_id, data.title, data.description || null, data.status, data.priority, data.due_date || null, data.category_id || null, data.recurrence || 'none', data.recurrence_end_date || null, data.parent_task_id || null, data.goal_id || null]
    })
    return (await this.findById(id, data.user_id))!
  },

  async createRecurring(task: Task): Promise<Task | null> {
    if (task.recurrence === 'none' || !task.due_date) return null

    const dueDate = new Date(task.due_date)
    switch (task.recurrence) {
      case 'daily': dueDate.setDate(dueDate.getDate() + 1); break
      case 'weekly': dueDate.setDate(dueDate.getDate() + 7); break
      case 'monthly': dueDate.setMonth(dueDate.getMonth() + 1); break
    }

    if (task.recurrence_end_date && dueDate.toISOString().split('T')[0] > task.recurrence_end_date) {
      return null
    }

    return this.create({
      user_id: task.user_id,
      title: task.title,
      description: task.description,
      status: 'todo',
      priority: task.priority,
      due_date: dueDate.toISOString().split('T')[0],
      category_id: task.category_id,
      recurrence: task.recurrence,
      recurrence_end_date: task.recurrence_end_date,
      parent_task_id: task.parent_task_id || task.id,
      goal_id: task.goal_id,
    })
  },

  async update(id: string, userId: string, data: {
    title?: string
    description?: string
    status?: 'todo' | 'in_progress' | 'done'
    priority?: 'low' | 'medium' | 'high'
    due_date?: string | null
    category_id?: string | null
    recurrence?: 'none' | 'daily' | 'weekly' | 'monthly'
    recurrence_end_date?: string | null
    goal_id?: string | null
  }): Promise<Task | undefined> {
    const db = getDB()

    const updates: string[] = []
    const values: any[] = []

    if (data.title !== undefined) { updates.push('title = ?'); values.push(data.title) }
    if (data.description !== undefined) { updates.push('description = ?'); values.push(data.description) }
    if (data.status !== undefined) { updates.push('status = ?'); values.push(data.status) }
    if (data.priority !== undefined) { updates.push('priority = ?'); values.push(data.priority) }
    if (data.due_date !== undefined) { updates.push('due_date = ?'); values.push(data.due_date) }
    if (data.category_id !== undefined) { updates.push('category_id = ?'); values.push(data.category_id) }
    if (data.recurrence !== undefined) { updates.push('recurrence = ?'); values.push(data.recurrence) }
    if (data.recurrence_end_date !== undefined) { updates.push('recurrence_end_date = ?'); values.push(data.recurrence_end_date) }
    if (data.goal_id !== undefined) { updates.push('goal_id = ?'); values.push(data.goal_id) }

    if (updates.length === 0) return this.findById(id, userId)

    const sql = `UPDATE tasks SET ${updates.join(', ')}, updated_at = datetime('now') WHERE id = ? AND user_id = ?`
    values.push(id, userId)

    await db.execute({ sql, args: values })

    if (data.status === 'done') {
      const task = await this.findById(id, userId)
      if (task && task.recurrence !== 'none') {
        await this.createRecurring(task)
      }
    }

    return this.findById(id, userId)
  },

  async delete(id: string, userId: string): Promise<boolean> {
    const db = getDB()
    await db.execute({ sql: 'DELETE FROM tasks WHERE id = ? AND user_id = ?', args: [id, userId] })
    return true
  },

  async getStats(userId: string) {
    const db = getDB()
    const result = await db.execute({
      sql: `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'todo' THEN 1 ELSE 0 END) as todo,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as done
      FROM tasks WHERE user_id = ?`,
      args: [userId]
    })
    if (result.rows.length > 0) {
      const row = result.rows[0]
      return {
        total: Number(row.total) || 0,
        todo: Number(row.todo) || 0,
        inProgress: Number(row.in_progress) || 0,
        done: Number(row.done) || 0,
      }
    }
    return { total: 0, todo: 0, inProgress: 0, done: 0 }
  },
}
