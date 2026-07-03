import { getDB } from '../db'

export interface Category {
  id: string
  user_id: string
  name: string
  color: string
  icon: string
  created_at: string
}

export const CategoryModel = {
  async findAll(userId: string): Promise<Category[]> {
    const result = await getDB().execute({
      sql: 'SELECT * FROM categories WHERE user_id = ? ORDER BY name',
      args: [userId]
    })
    return result.rows.map(row => ({
      id: row.id as string,
      user_id: row.user_id as string,
      name: row.name as string,
      color: row.color as string,
      icon: row.icon as string,
      created_at: row.created_at as string,
    }))
  },

  async findById(id: string, userId: string): Promise<Category | undefined> {
    const result = await getDB().execute({
      sql: 'SELECT * FROM categories WHERE id = ? AND user_id = ?',
      args: [id, userId]
    })
    if (result.rows.length === 0) return undefined
    const row = result.rows[0]
    return {
      id: row.id as string,
      user_id: row.user_id as string,
      name: row.name as string,
      color: row.color as string,
      icon: row.icon as string,
      created_at: row.created_at as string,
    }
  },

  async create(data: { user_id: string; name: string; color?: string; icon?: string }): Promise<Category> {
    const db = getDB()
    const id = crypto.randomUUID()
    await db.execute({
      sql: 'INSERT INTO categories (id, user_id, name, color, icon) VALUES (?, ?, ?, ?, ?)',
      args: [id, data.user_id, data.name, data.color || '#7c3aed', data.icon || '📁']
    })
    return (await this.findById(id, data.user_id))!
  },

  async update(id: string, userId: string, data: { name?: string; color?: string; icon?: string }): Promise<Category | undefined> {
    const db = getDB()
    const updates: string[] = []
    const values: any[] = []

    if (data.name !== undefined) { updates.push('name = ?'); values.push(data.name) }
    if (data.color !== undefined) { updates.push('color = ?'); values.push(data.color) }
    if (data.icon !== undefined) { updates.push('icon = ?'); values.push(data.icon) }

    if (updates.length === 0) return this.findById(id, userId)

    values.push(id, userId)
    await db.execute({ sql: `UPDATE categories SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`, args: values })
    return this.findById(id, userId)
  },

  async delete(id: string, userId: string): Promise<boolean> {
    const db = getDB()
    await db.execute({ sql: 'UPDATE tasks SET category_id = NULL WHERE category_id = ? AND user_id = ?', args: [id, userId] })
    await db.execute({ sql: 'DELETE FROM categories WHERE id = ? AND user_id = ?', args: [id, userId] })
    return true
  },
}
