import { getDB, saveDB } from '../db'

export interface ReadingItem { id: string; user_id: string; title: string; url: string; description: string | null; is_read: number; created_at: string }

function mapRows(stmt: any): ReadingItem[] {
  const results: ReadingItem[] = []
  while (stmt.step()) { const v = stmt.get(); results.push({ id: v[0], user_id: v[1], title: v[2], url: v[3], description: v[4], is_read: v[5], created_at: v[6] }) }
  stmt.free()
  return results
}

export const ReadingListModel = {
  findAll(userId: string): ReadingItem[] {
    const stmt = getDB().prepare('SELECT * FROM reading_list WHERE user_id = ? ORDER BY is_read ASC, created_at DESC')
    stmt.bind([userId])
    return mapRows(stmt)
  },

  create(data: { user_id: string; title: string; url: string; description?: string }): ReadingItem {
    const db = getDB(); const id = crypto.randomUUID()
    db.run('INSERT INTO reading_list (id, user_id, title, url, description) VALUES (?, ?, ?, ?, ?)',
      [id, data.user_id, data.title, data.url, data.description || null])
    saveDB()
    const all = this.findAll(data.user_id)
    return all.find(i => i.id === id)!
  },

  toggleRead(id: string, userId: string): ReadingItem | undefined {
    const db = getDB()
    db.run('UPDATE reading_list SET is_read = CASE WHEN is_read = 1 THEN 0 ELSE 1 END WHERE id = ? AND user_id = ?', [id, userId])
    saveDB()
    const all = this.findAll(userId)
    return all.find(i => i.id === id)
  },

  delete(id: string, userId: string): boolean {
    getDB().run('DELETE FROM reading_list WHERE id = ? AND user_id = ?', [id, userId])
    saveDB()
    return true
  },
}
