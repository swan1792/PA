import { getDB } from '../db'

export interface Journal {
  id: string; user_id: string; title: string | null; content: string
  mood: number | null; date: string; created_at: string; updated_at: string
}

function mapJournal(row: any): Journal {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    title: row.title as string | null,
    content: row.content as string,
    mood: row.mood as number | null,
    date: row.date as string,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  }
}

export const JournalModel = {
  async findAll(userId: string, limit = 50): Promise<Journal[]> {
    const result = await getDB().execute({
      sql: 'SELECT * FROM journals WHERE user_id = ? ORDER BY date DESC LIMIT ?',
      args: [userId, limit]
    })
    return result.rows.map(mapJournal)
  },

  async findByDate(userId: string, date: string): Promise<Journal | undefined> {
    const result = await getDB().execute({
      sql: 'SELECT * FROM journals WHERE user_id = ? AND date = ?',
      args: [userId, date]
    })
    if (result.rows.length === 0) return undefined
    return mapJournal(result.rows[0])
  },

  async create(data: { user_id: string; title?: string; content: string; mood?: number; date: string }): Promise<Journal> {
    const db = getDB()
    const id = crypto.randomUUID()
    await db.execute({
      sql: 'INSERT INTO journals (id, user_id, title, content, mood, date) VALUES (?, ?, ?, ?, ?, ?)',
      args: [id, data.user_id, data.title || null, data.content, data.mood || null, data.date]
    })
    return (await this.findByDate(data.user_id, data.date))!
  },

  async update(id: string, userId: string, data: { title?: string; content?: string; mood?: number }): Promise<Journal | undefined> {
    const db = getDB()
    const updates: string[] = []
    const values: any[] = []
    if (data.title !== undefined) { updates.push('title = ?'); values.push(data.title) }
    if (data.content !== undefined) { updates.push('content = ?'); values.push(data.content) }
    if (data.mood !== undefined) { updates.push('mood = ?'); values.push(data.mood) }
    if (updates.length === 0) return undefined
    values.push(id, userId)
    await db.execute({ sql: `UPDATE journals SET ${updates.join(', ')}, updated_at = datetime('now') WHERE id = ? AND user_id = ?`, args: values })
    const result = await getDB().execute({ sql: 'SELECT * FROM journals WHERE id = ?', args: [id] })
    if (result.rows.length === 0) return undefined
    return mapJournal(result.rows[0])
  },

  async delete(id: string, userId: string): Promise<boolean> {
    await getDB().execute({ sql: 'DELETE FROM journals WHERE id = ? AND user_id = ?', args: [id, userId] })
    return true
  },
}
