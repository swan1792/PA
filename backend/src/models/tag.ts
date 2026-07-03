import { getDB } from '../db'

export interface Tag { id: string; user_id: string; name: string; color: string; created_at: string }

export const TagModel = {
  async findAll(userId: string): Promise<Tag[]> {
    const result = await getDB().execute({
      sql: 'SELECT * FROM tags WHERE user_id = ? ORDER BY name',
      args: [userId]
    })
    return result.rows.map(row => ({
      id: row.id as string,
      user_id: row.user_id as string,
      name: row.name as string,
      color: row.color as string,
      created_at: row.created_at as string,
    }))
  },

  async create(data: { user_id: string; name: string; color?: string }): Promise<Tag> {
    const db = getDB()
    const id = crypto.randomUUID()
    await db.execute({
      sql: 'INSERT INTO tags (id, user_id, name, color) VALUES (?, ?, ?, ?)',
      args: [id, data.user_id, data.name, data.color || '#7c3aed']
    })
    const tags = await this.findAll(data.user_id)
    return tags.find(t => t.id === id)!
  },

  async delete(id: string, userId: string): Promise<boolean> {
    const db = getDB()
    await db.execute({ sql: 'DELETE FROM task_tags WHERE tag_id = ?', args: [id] })
    await db.execute({ sql: 'DELETE FROM tags WHERE id = ? AND user_id = ?', args: [id, userId] })
    return true
  },

  async addToTask(taskId: string, tagId: string): Promise<void> {
    await getDB().execute({
      sql: 'INSERT OR IGNORE INTO task_tags (task_id, tag_id) VALUES (?, ?)',
      args: [taskId, tagId]
    })
  },

  async removeFromTask(taskId: string, tagId: string): Promise<void> {
    await getDB().execute({
      sql: 'DELETE FROM task_tags WHERE task_id = ? AND tag_id = ?',
      args: [taskId, tagId]
    })
  },

  async getForTask(taskId: string): Promise<Tag[]> {
    const result = await getDB().execute({
      sql: 'SELECT t.* FROM tags t JOIN task_tags tt ON t.id = tt.tag_id WHERE tt.task_id = ?',
      args: [taskId]
    })
    return result.rows.map(row => ({
      id: row.id as string,
      user_id: row.user_id as string,
      name: row.name as string,
      color: row.color as string,
      created_at: row.created_at as string,
    }))
  },
}
