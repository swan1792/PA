import { getDB, saveDB } from '../db'

export interface Journal {
  id: string; user_id: string; title: string | null; content: string
  mood: number | null; date: string; created_at: string; updated_at: string
}

function mapRows(stmt: any): Journal[] {
  const results: Journal[] = []
  while (stmt.step()) {
    const v = stmt.get()
    results.push({ id: v[0], user_id: v[1], title: v[2], content: v[3], mood: v[4], date: v[5], created_at: v[6], updated_at: v[7] })
  }
  stmt.free()
  return results
}

export const JournalModel = {
  findAll(userId: string, limit = 50): Journal[] {
    const db = getDB()
    const stmt = db.prepare('SELECT * FROM journals WHERE user_id = ? ORDER BY date DESC LIMIT ?')
    stmt.bind([userId, limit])
    return mapRows(stmt)
  },

  findByDate(userId: string, date: string): Journal | undefined {
    const db = getDB()
    const stmt = db.prepare('SELECT * FROM journals WHERE user_id = ? AND date = ?')
    stmt.bind([userId, date])
    if (stmt.step()) { const v = stmt.get(); stmt.free(); return { id: v[0], user_id: v[1], title: v[2], content: v[3], mood: v[4], date: v[5], created_at: v[6], updated_at: v[7] } }
    stmt.free()
    return undefined
  },

  create(data: { user_id: string; title?: string; content: string; mood?: number; date: string }): Journal {
    const db = getDB()
    const id = crypto.randomUUID()
    db.run('INSERT INTO journals (id, user_id, title, content, mood, date) VALUES (?, ?, ?, ?, ?, ?)',
      [id, data.user_id, data.title || null, data.content, data.mood || null, data.date])
    saveDB()
    return this.findByDate(data.user_id, data.date)!
  },

  update(id: string, userId: string, data: { title?: string; content?: string; mood?: number }): Journal | undefined {
    const db = getDB()
    const updates: string[] = []; const values: any[] = []
    if (data.title !== undefined) { updates.push('title = ?'); values.push(data.title) }
    if (data.content !== undefined) { updates.push('content = ?'); values.push(data.content) }
    if (data.mood !== undefined) { updates.push('mood = ?'); values.push(data.mood) }
    if (updates.length === 0) return undefined
    values.push(id, userId)
    db.run(`UPDATE journals SET ${updates.join(', ')}, updated_at = datetime('now') WHERE id = ? AND user_id = ?`, values)
    saveDB()
    const stmt = getDB().prepare('SELECT * FROM journals WHERE id = ?')
    stmt.bind([id])
    if (stmt.step()) { const v = stmt.get(); stmt.free(); return { id: v[0], user_id: v[1], title: v[2], content: v[3], mood: v[4], date: v[5], created_at: v[6], updated_at: v[7] } }
    stmt.free()
    return undefined
  },

  delete(id: string, userId: string): boolean {
    getDB().run('DELETE FROM journals WHERE id = ? AND user_id = ?', [id, userId])
    saveDB()
    return true
  },
}
