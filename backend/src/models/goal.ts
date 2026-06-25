import { getDB, saveDB } from '../db'

export interface Goal {
  id: string
  user_id: string
  title: string
  description: string | null
  target_date: string | null
  status: 'active' | 'completed' | 'abandoned'
  progress: number
  created_at: string
  updated_at: string
}

function mapRow(stmt: any): Goal | null {
  if (stmt.step()) {
    const values = stmt.get()
    stmt.free()
    return {
      id: values[0] as string,
      user_id: values[1] as string,
      title: values[2] as string,
      description: values[3] as string | null,
      target_date: values[4] as string | null,
      status: values[5] as Goal['status'],
      progress: values[6] as number,
      created_at: values[7] as string,
      updated_at: values[8] as string,
    }
  }
  stmt.free()
  return null
}

function mapRows(stmt: any): Goal[] {
  const results: Goal[] = []
  while (stmt.step()) {
    const values = stmt.get()
    results.push({
      id: values[0] as string,
      user_id: values[1] as string,
      title: values[2] as string,
      description: values[3] as string | null,
      target_date: values[4] as string | null,
      status: values[5] as Goal['status'],
      progress: values[6] as number,
      created_at: values[7] as string,
      updated_at: values[8] as string,
    })
  }
  stmt.free()
  return results
}

export const GoalModel = {
  findAll(userId: string): Goal[] {
    const db = getDB()
    const stmt = db.prepare('SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC')
    stmt.bind([userId])
    return mapRows(stmt)
  },

  findById(id: string, userId: string): Goal | undefined {
    const db = getDB()
    const stmt = db.prepare('SELECT * FROM goals WHERE id = ? AND user_id = ?')
    stmt.bind([id, userId])
    return mapRow(stmt) || undefined
  },

  create(data: {
    user_id: string
    title: string
    description?: string
    target_date?: string
  }): Goal {
    const db = getDB()
    const id = crypto.randomUUID()
    db.run(
      'INSERT INTO goals (id, user_id, title, description, target_date) VALUES (?, ?, ?, ?, ?)',
      [id, data.user_id, data.title, data.description || null, data.target_date || null]
    )
    saveDB()
    return this.findById(id, data.user_id)!
  },

  update(id: string, userId: string, data: {
    title?: string
    description?: string
    target_date?: string | null
    status?: 'active' | 'completed' | 'abandoned'
    progress?: number
  }): Goal | undefined {
    const db = getDB()
    const updates: string[] = []
    const values: any[] = []

    if (data.title !== undefined) { updates.push('title = ?'); values.push(data.title) }
    if (data.description !== undefined) { updates.push('description = ?'); values.push(data.description) }
    if (data.target_date !== undefined) { updates.push('target_date = ?'); values.push(data.target_date) }
    if (data.status !== undefined) { updates.push('status = ?'); values.push(data.status) }
    if (data.progress !== undefined) { updates.push('progress = ?'); values.push(data.progress) }

    if (updates.length === 0) return this.findById(id, userId)

    values.push(id, userId)
    db.run(`UPDATE goals SET ${updates.join(', ')}, updated_at = datetime('now') WHERE id = ? AND user_id = ?`, values)
    saveDB()
    return this.findById(id, userId)
  },

  delete(id: string, userId: string): boolean {
    const db = getDB()
    db.run('UPDATE tasks SET goal_id = NULL WHERE goal_id = ? AND user_id = ?', [id, userId])
    db.run('UPDATE habits SET goal_id = NULL WHERE goal_id = ? AND user_id = ?', [id, userId])
    db.run('DELETE FROM goals WHERE id = ? AND user_id = ?', [id, userId])
    saveDB()
    return true
  },

  getWithStats(userId: string) {
    const goals = this.findAll(userId)
    const db = getDB()

    return goals.map((goal) => {
      // Count linked tasks
      const taskStmt = db.prepare(`
        SELECT
          COUNT(*) as total,
          SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as completed
        FROM tasks WHERE goal_id = ? AND user_id = ?
      `)
      taskStmt.bind([goal.id, userId])
      let totalTasks = 0
      let completedTasks = 0
      if (taskStmt.step()) {
        const vals = taskStmt.get()
        totalTasks = (vals[0] as number) || 0
        completedTasks = (vals[1] as number) || 0
      }
      taskStmt.free()

      // Count linked habits
      const habitStmt = db.prepare('SELECT COUNT(*) FROM habits WHERE goal_id = ? AND user_id = ?')
      habitStmt.bind([goal.id, userId])
      let totalHabits = 0
      if (habitStmt.step()) {
        totalHabits = habitStmt.get()[0] as number
      }
      habitStmt.free()

      // Auto-calculate progress if tasks are linked
      const autoProgress = totalTasks > 0
        ? Math.round((completedTasks / totalTasks) * 100)
        : goal.progress

      return {
        ...goal,
        progress: autoProgress,
        stats: { totalTasks, completedTasks, totalHabits },
      }
    })
  },
}
