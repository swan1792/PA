import { getDB, saveDB } from '../db'

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

function mapRow(stmt: any): Task | null {
  if (stmt.step()) {
    const values = stmt.get()
    stmt.free()
    return {
      id: values[0] as string,
      user_id: values[1] as string,
      title: values[2] as string,
      description: values[3] as string | undefined,
      status: values[4] as Task['status'],
      priority: values[5] as Task['priority'],
      due_date: values[6] as string | undefined,
      category_id: values[7] as string | undefined,
      recurrence: (values[8] as Task['recurrence']) || 'none',
      recurrence_end_date: values[9] as string | undefined,
      parent_task_id: values[10] as string | undefined,
      goal_id: values[11] as string | undefined,
      created_at: values[12] as string,
      updated_at: values[13] as string,
    }
  }
  stmt.free()
  return null
}

function mapRows(stmt: any): Task[] {
  const results: Task[] = []
  while (stmt.step()) {
    const values = stmt.get()
    results.push({
      id: values[0] as string,
      user_id: values[1] as string,
      title: values[2] as string,
      description: values[3] as string | undefined,
      status: values[4] as Task['status'],
      priority: values[5] as Task['priority'],
      due_date: values[6] as string | undefined,
      category_id: values[7] as string | undefined,
      recurrence: (values[8] as Task['recurrence']) || 'none',
      recurrence_end_date: values[9] as string | undefined,
      parent_task_id: values[10] as string | undefined,
      goal_id: values[11] as string | undefined,
      created_at: values[12] as string,
      updated_at: values[13] as string,
    })
  }
  stmt.free()
  return results
}

export const TaskModel = {
  findAll(userId: string): Task[] {
    const db = getDB()
    const stmt = db.prepare('SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC')
    stmt.bind([userId])
    return mapRows(stmt)
  },

  findById(id: string, userId: string): Task | undefined {
    const db = getDB()
    const stmt = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?')
    stmt.bind([id, userId])
    return mapRow(stmt) || undefined
  },

  create(data: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Task {
    const db = getDB()
    const id = crypto.randomUUID()
    db.run(
      'INSERT INTO tasks (id, user_id, title, description, status, priority, due_date, category_id, recurrence, recurrence_end_date, parent_task_id, goal_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, data.user_id, data.title, data.description || null, data.status, data.priority, data.due_date || null, data.category_id || null, data.recurrence || 'none', data.recurrence_end_date || null, data.parent_task_id || null, data.goal_id || null]
    )
    saveDB()
    return this.findById(id, data.user_id)!
  },

  createRecurring(task: Task): Task | null {
    if (task.recurrence === 'none' || !task.due_date) return null

    const dueDate = new Date(task.due_date)
    switch (task.recurrence) {
      case 'daily': dueDate.setDate(dueDate.getDate() + 1); break
      case 'weekly': dueDate.setDate(dueDate.getDate() + 7); break
      case 'monthly': dueDate.setMonth(dueDate.getMonth() + 1); break
    }

    // Don't create if past end date
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

  update(id: string, userId: string, data: {
    title?: string
    description?: string
    status?: 'todo' | 'in_progress' | 'done'
    priority?: 'low' | 'medium' | 'high'
    due_date?: string | null
    category_id?: string | null
    recurrence?: 'none' | 'daily' | 'weekly' | 'monthly'
    recurrence_end_date?: string | null
    goal_id?: string | null
  }): Task | undefined {
    const db = getDB()

    // Build dynamic update
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

    db.run(sql, values)
    saveDB()

    // If task was just marked as done and has recurrence, create next occurrence
    if (data.status === 'done') {
      const task = this.findById(id, userId)
      if (task && task.recurrence !== 'none') {
        this.createRecurring(task)
      }
    }

    return this.findById(id, userId)
  },

  delete(id: string, userId: string): boolean {
    const db = getDB()
    db.run('DELETE FROM tasks WHERE id = ? AND user_id = ?', [id, userId])
    saveDB()
    return true
  },

  getStats(userId: string) {
    const db = getDB()
    const stmt = db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'todo' THEN 1 ELSE 0 END) as todo,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as done
      FROM tasks WHERE user_id = ?
    `)
    stmt.bind([userId])
    if (stmt.step()) {
      const values = stmt.get()
      stmt.free()
      return {
        total: (values[0] as number) || 0,
        todo: (values[1] as number) || 0,
        inProgress: (values[2] as number) || 0,
        done: (values[3] as number) || 0,
      }
    }
    stmt.free()
    return { total: 0, todo: 0, inProgress: 0, done: 0 }
  },
}
