import { getDB } from '../db'

export interface Expense { id: string; user_id: string; amount: number; category: string; description: string | null; date: string; created_at: string }

export const ExpenseModel = {
  async findAll(userId: string, limit = 100): Promise<Expense[]> {
    const result = await getDB().execute({
      sql: 'SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC LIMIT ?',
      args: [userId, limit]
    })
    return result.rows.map(row => ({
      id: row.id as string,
      user_id: row.user_id as string,
      amount: row.amount as number,
      category: row.category as string,
      description: row.description as string | null,
      date: row.date as string,
      created_at: row.created_at as string,
    }))
  },

  async findByDateRange(userId: string, startDate: string, endDate: string): Promise<Expense[]> {
    const result = await getDB().execute({
      sql: 'SELECT * FROM expenses WHERE user_id = ? AND date >= ? AND date <= ? ORDER BY date DESC',
      args: [userId, startDate, endDate]
    })
    return result.rows.map(row => ({
      id: row.id as string,
      user_id: row.user_id as string,
      amount: row.amount as number,
      category: row.category as string,
      description: row.description as string | null,
      date: row.date as string,
      created_at: row.created_at as string,
    }))
  },

  async create(data: { user_id: string; amount: number; category: string; description?: string; date: string }): Promise<Expense> {
    const db = getDB()
    const id = crypto.randomUUID()
    await db.execute({
      sql: 'INSERT INTO expenses (id, user_id, amount, category, description, date) VALUES (?, ?, ?, ?, ?, ?)',
      args: [id, data.user_id, data.amount, data.category, data.description || null, data.date]
    })
    const all = await this.findAll(data.user_id)
    return all.find(e => e.id === id)!
  },

  async delete(id: string, userId: string): Promise<boolean> {
    await getDB().execute({ sql: 'DELETE FROM expenses WHERE id = ? AND user_id = ?', args: [id, userId] })
    return true
  },

  async getStats(userId: string, startDate: string, endDate: string) {
    const result = await getDB().execute({
      sql: `SELECT category, SUM(amount) as total, COUNT(*) as count
        FROM expenses WHERE user_id = ? AND date >= ? AND date <= ?
        GROUP BY category ORDER BY total DESC`,
      args: [userId, startDate, endDate]
    })
    const categories = result.rows.map(row => ({
      category: row.category as string,
      total: row.total as number,
      count: Number(row.count),
    }))
    const total = categories.reduce((sum, c) => sum + c.total, 0)
    return { total, categories }
  },
}
