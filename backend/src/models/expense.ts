import { getDB, saveDB } from '../db'

export interface Expense { id: string; user_id: string; amount: number; category: string; description: string | null; date: string; created_at: string }

function mapRows(stmt: any): Expense[] {
  const results: Expense[] = []
  while (stmt.step()) { const v = stmt.get(); results.push({ id: v[0], user_id: v[1], amount: v[2], category: v[3], description: v[4], date: v[5], created_at: v[6] }) }
  stmt.free()
  return results
}

export const ExpenseModel = {
  findAll(userId: string, limit = 100): Expense[] {
    const stmt = getDB().prepare('SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC LIMIT ?')
    stmt.bind([userId, limit])
    return mapRows(stmt)
  },

  findByDateRange(userId: string, startDate: string, endDate: string): Expense[] {
    const stmt = getDB().prepare('SELECT * FROM expenses WHERE user_id = ? AND date >= ? AND date <= ? ORDER BY date DESC')
    stmt.bind([userId, startDate, endDate])
    return mapRows(stmt)
  },

  create(data: { user_id: string; amount: number; category: string; description?: string; date: string }): Expense {
    const db = getDB(); const id = crypto.randomUUID()
    db.run('INSERT INTO expenses (id, user_id, amount, category, description, date) VALUES (?, ?, ?, ?, ?, ?)',
      [id, data.user_id, data.amount, data.category, data.description || null, data.date])
    saveDB()
    const all = this.findAll(data.user_id)
    return all.find(e => e.id === id)!
  },

  delete(id: string, userId: string): boolean {
    getDB().run('DELETE FROM expenses WHERE id = ? AND user_id = ?', [id, userId])
    saveDB()
    return true
  },

  getStats(userId: string, startDate: string, endDate: string) {
    const db = getDB()
    const stmt = db.prepare(`
      SELECT category, SUM(amount) as total, COUNT(*) as count
      FROM expenses WHERE user_id = ? AND date >= ? AND date <= ?
      GROUP BY category ORDER BY total DESC
    `)
    stmt.bind([userId, startDate, endDate])
    const categories: { category: string; total: number; count: number }[] = []
    while (stmt.step()) { const v = stmt.get(); categories.push({ category: v[0], total: v[1], count: v[2] }) }
    stmt.free()
    const total = categories.reduce((sum, c) => sum + c.total, 0)
    return { total, categories }
  },
}
