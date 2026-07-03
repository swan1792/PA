import { getDB } from '../db'

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

function mapGoal(row: any): Goal {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    title: row.title as string,
    description: row.description as string | null,
    target_date: row.target_date as string | null,
    status: row.status as Goal['status'],
    progress: row.progress as number,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  }
}

export const GoalModel = {
  async findAll(userId: string): Promise<Goal[]> {
    const result = await getDB().execute({
      sql: 'SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC',
      args: [userId]
    })
    return result.rows.map(mapGoal)
  },

  async findById(id: string, userId: string): Promise<Goal | undefined> {
    const result = await getDB().execute({
      sql: 'SELECT * FROM goals WHERE id = ? AND user_id = ?',
      args: [id, userId]
    })
    if (result.rows.length === 0) return undefined
    return mapGoal(result.rows[0])
  },

  async create(data: {
    user_id: string
    title: string
    description?: string
    target_date?: string
  }): Promise<Goal> {
    const db = getDB()
    const id = crypto.randomUUID()
    await db.execute({
      sql: 'INSERT INTO goals (id, user_id, title, description, target_date) VALUES (?, ?, ?, ?, ?)',
      args: [id, data.user_id, data.title, data.description || null, data.target_date || null]
    })
    return (await this.findById(id, data.user_id))!
  },

  async update(id: string, userId: string, data: {
    title?: string
    description?: string
    target_date?: string | null
    status?: 'active' | 'completed' | 'abandoned'
    progress?: number
  }): Promise<Goal | undefined> {
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
    await db.execute({ sql: `UPDATE goals SET ${updates.join(', ')}, updated_at = datetime('now') WHERE id = ? AND user_id = ?`, args: values })
    return this.findById(id, userId)
  },

  async delete(id: string, userId: string): Promise<boolean> {
    const db = getDB()
    await db.execute({ sql: 'UPDATE tasks SET goal_id = NULL WHERE goal_id = ? AND user_id = ?', args: [id, userId] })
    await db.execute({ sql: 'UPDATE habits SET goal_id = NULL WHERE goal_id = ? AND user_id = ?', args: [id, userId] })
    await db.execute({ sql: 'DELETE FROM goals WHERE id = ? AND user_id = ?', args: [id, userId] })
    return true
  },

  async getWithStats(userId: string) {
    const goals = await this.findAll(userId)
    const db = getDB()

    return Promise.all(goals.map(async (goal) => {
      const taskResult = await db.execute({
        sql: `SELECT COUNT(*) as total, SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as completed
          FROM tasks WHERE goal_id = ? AND user_id = ?`,
        args: [goal.id, userId]
      })
      const totalTasks = Number(taskResult.rows[0]?.total) || 0
      const completedTasks = Number(taskResult.rows[0]?.completed) || 0

      const habitResult = await db.execute({
        sql: 'SELECT COUNT(*) as count FROM habits WHERE goal_id = ? AND user_id = ?',
        args: [goal.id, userId]
      })
      const totalHabits = Number(habitResult.rows[0]?.count) || 0

      const autoProgress = totalTasks > 0
        ? Math.round((completedTasks / totalTasks) * 100)
        : goal.progress

      return {
        ...goal,
        progress: autoProgress,
        stats: { totalTasks, completedTasks, totalHabits },
      }
    }))
  },
}
