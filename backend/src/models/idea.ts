import { getDB, saveDB } from '../db'

export interface Idea { id: string; user_id: string; content: string; color: string; position_x: number; position_y: number; created_at: string; updated_at: string }

function mapRows(stmt: any): Idea[] {
  const results: Idea[] = []
  while (stmt.step()) { const v = stmt.get(); results.push({ id: v[0], user_id: v[1], content: v[2], color: v[3], position_x: v[4], position_y: v[5], created_at: v[6], updated_at: v[7] }) }
  stmt.free()
  return results
}

export const IdeaModel = {
  findAll(userId: string): Idea[] {
    const stmt = getDB().prepare('SELECT * FROM ideas WHERE user_id = ? ORDER BY created_at DESC')
    stmt.bind([userId])
    return mapRows(stmt)
  },

  create(data: { user_id: string; content: string; color?: string; position_x?: number; position_y?: number }): Idea {
    const db = getDB(); const id = crypto.randomUUID()
    db.run('INSERT INTO ideas (id, user_id, content, color, position_x, position_y) VALUES (?, ?, ?, ?, ?, ?)',
      [id, data.user_id, data.content, data.color || '#fef3c7', data.position_x || 0, data.position_y || 0])
    saveDB()
    const all = this.findAll(data.user_id)
    return all.find(i => i.id === id)!
  },

  update(id: string, userId: string, data: { content?: string; color?: string; position_x?: number; position_y?: number }): Idea | undefined {
    const db = getDB(); const updates: string[] = []; const values: any[] = []
    if (data.content !== undefined) { updates.push('content = ?'); values.push(data.content) }
    if (data.color !== undefined) { updates.push('color = ?'); values.push(data.color) }
    if (data.position_x !== undefined) { updates.push('position_x = ?'); values.push(data.position_x) }
    if (data.position_y !== undefined) { updates.push('position_y = ?'); values.push(data.position_y) }
    if (updates.length === 0) return undefined
    values.push(id, userId)
    db.run(`UPDATE ideas SET ${updates.join(', ')}, updated_at = datetime('now') WHERE id = ? AND user_id = ?`, values)
    saveDB()
    const all = this.findAll(userId)
    return all.find(i => i.id === id)
  },

  delete(id: string, userId: string): boolean {
    getDB().run('DELETE FROM ideas WHERE id = ? AND user_id = ?', [id, userId])
    saveDB()
    return true
  },
}
