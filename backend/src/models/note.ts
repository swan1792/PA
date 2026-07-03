import { getDB } from '../db'

export interface Note {
  id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
}

export const NoteModel = {
  async findByUserId(userId: string): Promise<Note | undefined> {
    const db = getDB()
    const result = await db.execute({
      sql: 'SELECT * FROM notes WHERE user_id = ?',
      args: [userId]
    })
    if (result.rows.length === 0) return undefined
    const row = result.rows[0]
    return {
      id: row.id as string,
      user_id: row.user_id as string,
      content: row.content as string,
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
    }
  },

  async upsert(userId: string, content: string): Promise<Note> {
    const db = getDB()
    const existing = await this.findByUserId(userId)

    if (existing) {
      await db.execute({
        sql: "UPDATE notes SET content = ?, updated_at = datetime('now') WHERE user_id = ?",
        args: [content, userId]
      })
    } else {
      const id = crypto.randomUUID()
      await db.execute({
        sql: 'INSERT INTO notes (id, user_id, content) VALUES (?, ?, ?)',
        args: [id, userId, content]
      })
    }
    return (await this.findByUserId(userId))!
  },
}
