import { getDB } from '../db'

export interface ReadingItem { id: string; user_id: string; title: string; url: string; description: string | null; is_read: number; created_at: string }

export const ReadingListModel = {
  async findAll(userId: string): Promise<ReadingItem[]> {
    const result = await getDB().execute({
      sql: 'SELECT * FROM reading_list WHERE user_id = ? ORDER BY is_read ASC, created_at DESC',
      args: [userId]
    })
    return result.rows.map(row => ({
      id: row.id as string,
      user_id: row.user_id as string,
      title: row.title as string,
      url: row.url as string,
      description: row.description as string | null,
      is_read: row.is_read as number,
      created_at: row.created_at as string,
    }))
  },

  async create(data: { user_id: string; title: string; url: string; description?: string }): Promise<ReadingItem> {
    const db = getDB()
    const id = crypto.randomUUID()
    await db.execute({
      sql: 'INSERT INTO reading_list (id, user_id, title, url, description) VALUES (?, ?, ?, ?, ?)',
      args: [id, data.user_id, data.title, data.url, data.description || null]
    })
    const all = await this.findAll(data.user_id)
    return all.find(i => i.id === id)!
  },

  async toggleRead(id: string, userId: string): Promise<ReadingItem | undefined> {
    await getDB().execute({
      sql: 'UPDATE reading_list SET is_read = CASE WHEN is_read = 1 THEN 0 ELSE 1 END WHERE id = ? AND user_id = ?',
      args: [id, userId]
    })
    const all = await this.findAll(userId)
    return all.find(i => i.id === id)
  },

  async delete(id: string, userId: string): Promise<boolean> {
    await getDB().execute({ sql: 'DELETE FROM reading_list WHERE id = ? AND user_id = ?', args: [id, userId] })
    return true
  },
}
