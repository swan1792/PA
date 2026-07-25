import { getDB } from '../db'

export interface Budget {
  id: string
  user_id: string
  category: string  // empty string '' means overall budget
  month: string
  amount: number
  created_at: string
  updated_at: string
}

export interface BudgetWithSpending extends Budget {
  spent: number
  remaining: number
  percentUsed: number
}

export const BudgetModel = {
  async findAll(userId: string, month: string): Promise<Budget[]> {
    const result = await getDB().execute({
      sql: 'SELECT * FROM budgets WHERE user_id = ? AND month = ? ORDER BY category ASC',
      args: [userId, month],
    })
    return result.rows.map(row => ({
      id: row.id as string,
      user_id: row.user_id as string,
      category: row.category as string,
      month: row.month as string,
      amount: row.amount as number,
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
    }))
  },

  async findWithSpending(userId: string, month: string): Promise<BudgetWithSpending[]> {
    const budgets = await this.findAll(userId, month)

    // Get spending by category for the month
    const [year, mon] = month.split('-')
    const startDate = `${year}-${mon}-01`
    const endDateObj = new Date(parseInt(year), parseInt(mon), 1)
    endDateObj.setMonth(endDateObj.getMonth() + 1)
    const endDate = endDateObj.toISOString().split('T')[0]

    const spendingResult = await getDB().execute({
      sql: `SELECT COALESCE(category, '') as category, SUM(amount) as total
        FROM expenses WHERE user_id = ? AND date >= ? AND date < ?
        GROUP BY category`,
      args: [userId, startDate, endDate],
    })

    const spendingByCategory: Record<string, number> = {}
    let totalSpent = 0
    for (const row of spendingResult.rows) {
      const cat = row.category as string
      const total = row.total as number
      spendingByCategory[cat] = total
      totalSpent += total
    }

    return budgets.map(b => {
      const spent = b.category ? (spendingByCategory[b.category] || 0) : totalSpent
      const remaining = b.amount - spent
      const percentUsed = b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0
      return { ...b, spent: Math.round(spent * 100) / 100, remaining: Math.round(remaining * 100) / 100, percentUsed }
    })
  },

  async upsert(data: { user_id: string; category: string; month: string; amount: number }): Promise<Budget> {
    const db = getDB()

    // Check if budget exists (empty string for overall)
    const hasCategory = !!data.category
    const catCondition = hasCategory ? 'category = ?' : "(category = '' OR category IS NULL)"

    const existing = await db.execute({
      sql: `SELECT * FROM budgets WHERE user_id = ? AND ${catCondition} AND month = ?`,
      args: hasCategory ? [data.user_id, data.category, data.month] : [data.user_id, data.month],
    })

    if (existing.rows.length > 0) {
      const existingId = existing.rows[0].id as string
      await db.execute({
        sql: "UPDATE budgets SET amount = ?, updated_at = datetime('now') WHERE id = ?",
        args: [data.amount, existingId],
      })
      return { ...existing.rows[0], amount: data.amount } as unknown as Budget
    } else {
      const id = crypto.randomUUID()
      await db.execute({
        sql: 'INSERT INTO budgets (id, user_id, category, month, amount) VALUES (?, ?, ?, ?, ?)',
        args: [id, data.user_id, data.category || '', data.month, data.amount],
      })
      return {
        id,
        user_id: data.user_id,
        category: data.category || '',
        month: data.month,
        amount: data.amount,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    }
  },

  async delete(id: string, userId: string): Promise<boolean> {
    await getDB().execute({
      sql: 'DELETE FROM budgets WHERE id = ? AND user_id = ?',
      args: [id, userId],
    })
    return true
  },
}
