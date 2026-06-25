import { getDB, saveDB } from '../db'

export interface Note {
  id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
}

function mapRow(stmt: any): Note | null {
  if (stmt.step()) {
    const values = stmt.get()
    stmt.free()
    return {
      id: values[0] as string,
      user_id: values[1] as string,
      content: values[2] as string,
      created_at: values[3] as string,
      updated_at: values[4] as string,
    }
  }
  stmt.free()
  return null
}

export const NoteModel = {
  findByUserId(userId: string): Note | undefined {
    const db = getDB()
    const stmt = db.prepare('SELECT * FROM notes WHERE user_id = ?')
    stmt.bind([userId])
    return mapRow(stmt) || undefined
  },

  upsert(userId: string, content: string): Note {
    const db = getDB()
    const existing = this.findByUserId(userId)

    if (existing) {
      db.run(
        "UPDATE notes SET content = ?, updated_at = datetime('now') WHERE user_id = ?",
        [content, userId]
      )
    } else {
      const id = crypto.randomUUID()
      db.run(
        'INSERT INTO notes (id, user_id, content) VALUES (?, ?, ?)',
        [id, userId, content]
      )
    }
    saveDB()
    return this.findByUserId(userId)!
  },
}
