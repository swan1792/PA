import { getDB } from '../db'

export interface Mood {
  id: string
  user_id: string
  mood: number
  energy: number
  note: string | null
  date: string
  created_at: string
}

function mapMood(row: any): Mood {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    mood: row.mood as number,
    energy: row.energy as number,
    note: row.note as string | null,
    date: row.date as string,
    created_at: row.created_at as string,
  }
}

export const MoodModel = {
  async findByDateRange(userId: string, startDate: string, endDate: string): Promise<Mood[]> {
    const result = await getDB().execute({
      sql: 'SELECT * FROM moods WHERE user_id = ? AND date >= ? AND date <= ? ORDER BY date DESC',
      args: [userId, startDate, endDate]
    })
    return result.rows.map(mapMood)
  },

  async findByDate(userId: string, date: string): Promise<Mood | undefined> {
    const result = await getDB().execute({
      sql: 'SELECT * FROM moods WHERE user_id = ? AND date = ?',
      args: [userId, date]
    })
    if (result.rows.length === 0) return undefined
    return mapMood(result.rows[0])
  },

  async upsert(userId: string, data: { mood: number; energy: number; note?: string; date: string }): Promise<Mood> {
    const db = getDB()
    const existing = await this.findByDate(userId, data.date)

    if (existing) {
      await db.execute({
        sql: 'UPDATE moods SET mood = ?, energy = ?, note = ? WHERE user_id = ? AND date = ?',
        args: [data.mood, data.energy, data.note || null, userId, data.date]
      })
    } else {
      const id = crypto.randomUUID()
      await db.execute({
        sql: 'INSERT INTO moods (id, user_id, mood, energy, note, date) VALUES (?, ?, ?, ?, ?, ?)',
        args: [id, userId, data.mood, data.energy, data.note || null, data.date]
      })
    }
    return (await this.findByDate(userId, data.date))!
  },

  async getStats(userId: string, days: number = 30) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    const startStr = startDate.toISOString().split('T')[0]

    const result = await getDB().execute({
      sql: `SELECT AVG(mood) as avg_mood, AVG(energy) as avg_energy,
        MIN(mood) as min_mood, MAX(mood) as max_mood, COUNT(*) as entries
        FROM moods WHERE user_id = ? AND date >= ?`,
      args: [userId, startStr]
    })

    if (result.rows.length > 0) {
      const row = result.rows[0]
      return {
        avgMood: Math.round((Number(row.avg_mood) || 0) * 10) / 10,
        avgEnergy: Math.round((Number(row.avg_energy) || 0) * 10) / 10,
        minMood: Number(row.min_mood) || 0,
        maxMood: Number(row.max_mood) || 0,
        entries: Number(row.entries) || 0,
      }
    }
    return { avgMood: 0, avgEnergy: 0, minMood: 0, maxMood: 0, entries: 0 }
  },
}
