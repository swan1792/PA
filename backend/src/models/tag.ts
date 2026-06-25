import { getDB, saveDB } from '../db'

export interface Tag { id: string; user_id: string; name: string; color: string; created_at: string }

function mapRows(stmt: any): Tag[] {
  const results: Tag[] = []
  while (stmt.step()) { const v = stmt.get(); results.push({ id: v[0], user_id: v[1], name: v[2], color: v[3], created_at: v[4] }) }
  stmt.free()
  return results
}

export const TagModel = {
  findAll(userId: string): Tag[] {
    const stmt = getDB().prepare('SELECT * FROM tags WHERE user_id = ? ORDER BY name')
    stmt.bind([userId])
    return mapRows(stmt)
  },

  create(data: { user_id: string; name: string; color?: string }): Tag {
    const db = getDB(); const id = crypto.randomUUID()
    db.run('INSERT INTO tags (id, user_id, name, color) VALUES (?, ?, ?, ?)', [id, data.user_id, data.name, data.color || '#7c3aed'])
    saveDB()
    const tags = this.findAll(data.user_id)
    return tags.find(t => t.id === id)!
  },

  delete(id: string, userId: string): boolean {
    const db = getDB()
    db.run('DELETE FROM task_tags WHERE tag_id = ?', [id])
    db.run('DELETE FROM tags WHERE id = ? AND user_id = ?', [id, userId])
    saveDB()
    return true
  },

  addToTask(taskId: string, tagId: string): void {
    getDB().run('INSERT OR IGNORE INTO task_tags (task_id, tag_id) VALUES (?, ?)', [taskId, tagId])
    saveDB()
  },

  removeFromTask(taskId: string, tagId: string): void {
    getDB().run('DELETE FROM task_tags WHERE task_id = ? AND tag_id = ?', [taskId, tagId])
    saveDB()
  },

  getForTask(taskId: string): Tag[] {
    const stmt = getDB().prepare('SELECT t.* FROM tags t JOIN task_tags tt ON t.id = tt.tag_id WHERE tt.task_id = ?')
    stmt.bind([taskId])
    return mapRows(stmt)
  },
}
