import { getDB, saveDB } from '../db'

export interface Mood {
  id: string
  user_id: string
  mood: number
  energy: number
  note: string | null
  date: string
  created_at: string
}

function mapRow(stmt: any): Mood | null {
  if (stmt.step()) {
    const values = stmt.get()
    stmt.free()
    return {
      id: values[0] as string,
      user_id: values[1] as string,
      mood: values[2] as number,
      energy: values[3] as number,
      note: values[4] as string | null,
      date: values[5] as string,
      created_at: values[6] as string,
    }
  }
  stmt.free()
  return null
}

function mapRows(stmt: any): Mood[] {
  const results: Mood[] = []
  while (stmt.step()) {
    const values = stmt.get()
    results.push({
      id: values[0] as string,
      user_id: values[1] as string,
      mood: values[2] as number,
      energy: values[3] as number,
      note: values[4] as string | null,
      date: values[5] as string,
      created_at: values[6] as string,
    })
  }
  stmt.free()
  return results
}

export const MoodModel = {
  findByDateRange(userId: string, startDate: string, endDate: string): Mood[] {
    const db = getDB()
    const stmt = db.prepare('SELECT * FROM moods WHERE user_id = ? AND date >= ? AND date <= ? ORDER BY date DESC')
    stmt.bind([userId, startDate, endDate])
    return mapRows(stmt)
  },

  findByDate(userId: string, date: string): Mood | undefined {
    const db = getDB()
    const stmt = db.prepare('SELECT * FROM moods WHERE user_id = ? AND date = ?')
    stmt.bind([userId, date])
    return mapRow(stmt) || undefined
  },

  upsert(userId: string, data: { mood: number; energy: number; note?: string; date: string }): Mood {
    const db = getDB()
    const existing = this.findByDate(userId, data.date)

    if (existing) {
      db.run(
        'UPDATE moods SET mood = ?, energy = ?, note = ? WHERE user_id = ? AND date = ?',
        [data.mood, data.energy, data.note || null, userId, data.date]
      )
    } else {
      const id = crypto.randomUUID()
      db.run(
        'INSERT INTO moods (id, user_id, mood, energy, note, date) VALUES (?, ?, ?, ?, ?, ?)',
        [id, userId, data.mood, data.energy, data.note || null, data.date]
      )
    }
    saveDB()
    return this.findByDate(userId, data.date)!
  },

  getStats(userId: string, days: number = 30) {
    const db = getDB()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    const startStr = startDate.toISOString().split('T')[0]

    const stmt = db.prepare(`
      SELECT
        AVG(mood) as avg_mood,
        AVG(energy) as avg_energy,
        MIN(mood) as min_mood,
        MAX(mood) as max_mood,
        COUNT(*) as entries
      FROM moods WHERE user_id = ? AND date >= ?
    `)
    stmt.bind([userId, startStr])
    if (stmt.step()) {
      const vals = stmt.get()
      stmt.free()
      return {
        avgMood: Math.round((vals[0] as number || 0) * 10) / 10,
        avgEnergy: Math.round((vals[1] as number || 0) * 10) / 10,
        minMood: vals[2] as number || 0,
        maxMood: vals[3] as number || 0,
        entries: vals[4] as number || 0,
      }
    }
    stmt.free()
    return { avgMood: 0, avgEnergy: 0, minMood: 0, maxMood: 0, entries: 0 }
  },
}
