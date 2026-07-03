import { getDB } from '../db'

export interface FocusSession {
  id: string
  user_id: string
  task_id: string | null
  duration: number
  type: 'focus' | 'break'
  completed: number
  started_at: string
  ended_at: string | null
}

function mapSession(row: any): FocusSession {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    task_id: row.task_id as string | null,
    duration: row.duration as number,
    type: row.type as FocusSession['type'],
    completed: row.completed as number,
    started_at: row.started_at as string,
    ended_at: row.ended_at as string | null,
  }
}

export const FocusSessionModel = {
  async findAll(userId: string, limit: number = 50): Promise<FocusSession[]> {
    const result = await getDB().execute({
      sql: 'SELECT * FROM focus_sessions WHERE user_id = ? ORDER BY started_at DESC LIMIT ?',
      args: [userId, limit]
    })
    return result.rows.map(mapSession)
  },

  async findToday(userId: string): Promise<FocusSession[]> {
    const today = new Date().toISOString().split('T')[0]
    const result = await getDB().execute({
      sql: "SELECT * FROM focus_sessions WHERE user_id = ? AND date(started_at) = ? ORDER BY started_at DESC",
      args: [userId, today]
    })
    return result.rows.map(mapSession)
  },

  async findById(id: string, userId: string): Promise<FocusSession | undefined> {
    const result = await getDB().execute({
      sql: 'SELECT * FROM focus_sessions WHERE id = ? AND user_id = ?',
      args: [id, userId]
    })
    if (result.rows.length === 0) return undefined
    return mapSession(result.rows[0])
  },

  async create(data: {
    user_id: string
    task_id?: string
    duration?: number
    type?: 'focus' | 'break'
  }): Promise<FocusSession> {
    const db = getDB()
    const id = crypto.randomUUID()
    await db.execute({
      sql: 'INSERT INTO focus_sessions (id, user_id, task_id, duration, type) VALUES (?, ?, ?, ?, ?)',
      args: [id, data.user_id, data.task_id || null, data.duration || 25, data.type || 'focus']
    })
    return (await this.findById(id, data.user_id))!
  },

  async complete(id: string, userId: string): Promise<FocusSession | undefined> {
    const db = getDB()
    await db.execute({
      sql: "UPDATE focus_sessions SET completed = 1, ended_at = datetime('now') WHERE id = ? AND user_id = ?",
      args: [id, userId]
    })
    return this.findById(id, userId)
  },

  async getStats(userId: string) {
    const db = getDB()
    const today = new Date().toISOString().split('T')[0]

    const todayResult = await db.execute({
      sql: `SELECT COUNT(*) as sessions, COALESCE(SUM(duration), 0) as total_minutes
        FROM focus_sessions WHERE user_id = ? AND date(started_at) = ? AND completed = 1 AND type = 'focus'`,
      args: [userId, today]
    })
    const todaySessions = Number(todayResult.rows[0]?.sessions) || 0
    const todayMinutes = Number(todayResult.rows[0]?.total_minutes) || 0

    const allResult = await db.execute({
      sql: `SELECT COUNT(*) as sessions, COALESCE(SUM(duration), 0) as total_minutes
        FROM focus_sessions WHERE user_id = ? AND completed = 1 AND type = 'focus'`,
      args: [userId]
    })
    const totalSessions = Number(allResult.rows[0]?.sessions) || 0
    const totalMinutes = Number(allResult.rows[0]?.total_minutes) || 0

    return {
      today: { sessions: todaySessions, minutes: todayMinutes },
      total: { sessions: totalSessions, minutes: totalMinutes },
    }
  },
}
