import { getDB, saveDB } from '../db'

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

function mapRow(stmt: any): FocusSession | null {
  if (stmt.step()) {
    const values = stmt.get()
    stmt.free()
    return {
      id: values[0] as string,
      user_id: values[1] as string,
      task_id: values[2] as string | null,
      duration: values[3] as number,
      type: values[4] as FocusSession['type'],
      completed: values[5] as number,
      started_at: values[6] as string,
      ended_at: values[7] as string | null,
    }
  }
  stmt.free()
  return null
}

function mapRows(stmt: any): FocusSession[] {
  const results: FocusSession[] = []
  while (stmt.step()) {
    const values = stmt.get()
    results.push({
      id: values[0] as string,
      user_id: values[1] as string,
      task_id: values[2] as string | null,
      duration: values[3] as number,
      type: values[4] as FocusSession['type'],
      completed: values[5] as number,
      started_at: values[6] as string,
      ended_at: values[7] as string | null,
    })
  }
  stmt.free()
  return results
}

export const FocusSessionModel = {
  findAll(userId: string, limit: number = 50): FocusSession[] {
    const db = getDB()
    const stmt = db.prepare('SELECT * FROM focus_sessions WHERE user_id = ? ORDER BY started_at DESC LIMIT ?')
    stmt.bind([userId, limit])
    return mapRows(stmt)
  },

  findToday(userId: string): FocusSession[] {
    const db = getDB()
    const today = new Date().toISOString().split('T')[0]
    const stmt = db.prepare("SELECT * FROM focus_sessions WHERE user_id = ? AND date(started_at) = ? ORDER BY started_at DESC")
    stmt.bind([userId, today])
    return mapRows(stmt)
  },

  findById(id: string, userId: string): FocusSession | undefined {
    const db = getDB()
    const stmt = db.prepare('SELECT * FROM focus_sessions WHERE id = ? AND user_id = ?')
    stmt.bind([id, userId])
    return mapRow(stmt) || undefined
  },

  create(data: {
    user_id: string
    task_id?: string
    duration?: number
    type?: 'focus' | 'break'
  }): FocusSession {
    const db = getDB()
    const id = crypto.randomUUID()
    db.run(
      'INSERT INTO focus_sessions (id, user_id, task_id, duration, type) VALUES (?, ?, ?, ?, ?)',
      [id, data.user_id, data.task_id || null, data.duration || 25, data.type || 'focus']
    )
    saveDB()
    return this.findById(id, data.user_id)!
  },

  complete(id: string, userId: string): FocusSession | undefined {
    const db = getDB()
    db.run(
      "UPDATE focus_sessions SET completed = 1, ended_at = datetime('now') WHERE id = ? AND user_id = ?",
      [id, userId]
    )
    saveDB()
    return this.findById(id, userId)
  },

  getStats(userId: string) {
    const db = getDB()
    const today = new Date().toISOString().split('T')[0]

    // Today's stats
    const todayStmt = db.prepare(`
      SELECT COUNT(*) as sessions, COALESCE(SUM(duration), 0) as total_minutes
      FROM focus_sessions WHERE user_id = ? AND date(started_at) = ? AND completed = 1 AND type = 'focus'
    `)
    todayStmt.bind([userId, today])
    let todaySessions = 0
    let todayMinutes = 0
    if (todayStmt.step()) {
      const vals = todayStmt.get()
      todaySessions = (vals[0] as number) || 0
      todayMinutes = (vals[1] as number) || 0
    }
    todayStmt.free()

    // All-time stats
    const allStmt = db.prepare(`
      SELECT COUNT(*) as sessions, COALESCE(SUM(duration), 0) as total_minutes
      FROM focus_sessions WHERE user_id = ? AND completed = 1 AND type = 'focus'
    `)
    allStmt.bind([userId])
    let totalSessions = 0
    let totalMinutes = 0
    if (allStmt.step()) {
      const vals = allStmt.get()
      totalSessions = (vals[0] as number) || 0
      totalMinutes = (vals[1] as number) || 0
    }
    allStmt.free()

    return {
      today: { sessions: todaySessions, minutes: todayMinutes },
      total: { sessions: totalSessions, minutes: totalMinutes },
    }
  },
}
