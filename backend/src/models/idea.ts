import { getDB } from '../db'

export interface Idea { id: string; user_id: string; content: string; color: string; position_x: number; position_y: number; created_at: string; updated_at: string }

export const IdeaModel = {
  async findAll(userId: string): Promise<Idea[]> {
    const result = await getDB().execute({
      sql: 'SELECT * FROM ideas WHERE user_id = ? ORDER BY created_at DESC',
      args: [userId]
    })
    return result.rows.map(row => ({
      id: row.id as string,
      user_id: row.user_id as string,
      content: row.content as string,
      color: row.color as string,
      position_x: row.position_x as number,
      position_y: row.position_y as number,
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
    }))
  },

  async create(data: { user_id: string; content: string; color?: string; position_x?: number; position_y?: number }): Promise<Idea> {
    const db = getDB()
    const id = crypto.randomUUID()
    await db.execute({
      sql: 'INSERT INTO ideas (id, user_id, content, color, position_x, position_y) VALUES (?, ?, ?, ?, ?, ?)',
      args: [id, data.user_id, data.content, data.color || '#fef3c7', data.position_x || 0, data.position_y || 0]
    })
    const all = await this.findAll(data.user_id)
    return all.find(i => i.id === id)!
  },

  async update(id: string, userId: string, data: { content?: string; color?: string; position_x?: number; position_y?: number }): Promise<Idea | undefined> {
    const db = getDB()
    const updates: string[] = []
    const values: any[] = []
    if (data.content !== undefined) { updates.push('content = ?'); values.push(data.content) }
    if (data.color !== undefined) { updates.push('color = ?'); values.push(data.color) }
    if (data.position_x !== undefined) { updates.push('position_x = ?'); values.push(data.position_x) }
    if (data.position_y !== undefined) { updates.push('position_y = ?'); values.push(data.position_y) }
    if (updates.length === 0) return undefined
    values.push(id, userId)
    await db.execute({ sql: `UPDATE ideas SET ${updates.join(', ')}, updated_at = datetime('now') WHERE id = ? AND user_id = ?`, args: values })
    const all = await this.findAll(userId)
    return all.find(i => i.id === id)
  },

  async delete(id: string, userId: string): Promise<boolean> {
    await getDB().execute({ sql: 'DELETE FROM ideas WHERE id = ? AND user_id = ?', args: [id, userId] })
    return true
  },
}
