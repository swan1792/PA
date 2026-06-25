import { getDB, saveDB } from '../db'

export interface Category {
  id: string
  user_id: string
  name: string
  color: string
  icon: string
  created_at: string
}

function mapRow(stmt: any): Category | null {
  if (stmt.step()) {
    const values = stmt.get()
    stmt.free()
    return {
      id: values[0] as string,
      user_id: values[1] as string,
      name: values[2] as string,
      color: values[3] as string,
      icon: values[4] as string,
      created_at: values[5] as string,
    }
  }
  stmt.free()
  return null
}

function mapRows(stmt: any): Category[] {
  const results: Category[] = []
  while (stmt.step()) {
    const values = stmt.get()
    results.push({
      id: values[0] as string,
      user_id: values[1] as string,
      name: values[2] as string,
      color: values[3] as string,
      icon: values[4] as string,
      created_at: values[5] as string,
    })
  }
  stmt.free()
  return results
}

export const CategoryModel = {
  findAll(userId: string): Category[] {
    const db = getDB()
    const stmt = db.prepare('SELECT * FROM categories WHERE user_id = ? ORDER BY name')
    stmt.bind([userId])
    return mapRows(stmt)
  },

  findById(id: string, userId: string): Category | undefined {
    const db = getDB()
    const stmt = db.prepare('SELECT * FROM categories WHERE id = ? AND user_id = ?')
    stmt.bind([id, userId])
    return mapRow(stmt) || undefined
  },

  create(data: { user_id: string; name: string; color?: string; icon?: string }): Category {
    const db = getDB()
    const id = crypto.randomUUID()
    db.run(
      'INSERT INTO categories (id, user_id, name, color, icon) VALUES (?, ?, ?, ?, ?)',
      [id, data.user_id, data.name, data.color || '#7c3aed', data.icon || '📁']
    )
    saveDB()
    return this.findById(id, data.user_id)!
  },

  update(id: string, userId: string, data: { name?: string; color?: string; icon?: string }): Category | undefined {
    const db = getDB()
    const updates: string[] = []
    const values: any[] = []

    if (data.name !== undefined) { updates.push('name = ?'); values.push(data.name) }
    if (data.color !== undefined) { updates.push('color = ?'); values.push(data.color) }
    if (data.icon !== undefined) { updates.push('icon = ?'); values.push(data.icon) }

    if (updates.length === 0) return this.findById(id, userId)

    values.push(id, userId)
    db.run(`UPDATE categories SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`, values)
    saveDB()
    return this.findById(id, userId)
  },

  delete(id: string, userId: string): boolean {
    const db = getDB()
    // Unlink tasks from this category first
    db.run('UPDATE tasks SET category_id = NULL WHERE category_id = ? AND user_id = ?', [id, userId])
    db.run('DELETE FROM categories WHERE id = ? AND user_id = ?', [id, userId])
    saveDB()
    return true
  },
}
