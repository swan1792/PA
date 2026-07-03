import { getDB } from '../db'

export interface Habit {
  id: string
  user_id: string
  name: string
  frequency: 'daily' | 'specific'
  specific_days: string | null
  category: string
  goal_id: string | null
  created_at: string
  updated_at: string
}

export interface HabitWithCompletions extends Omit<Habit, 'specific_days'> {
  specific_days: string[] | null
  completions: string[]
}

function mapHabit(row: any): Habit {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    name: row.name as string,
    frequency: row.frequency as Habit['frequency'],
    specific_days: row.specific_days as string | null,
    category: row.category as string,
    goal_id: row.goal_id as string | null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  }
}

export const HabitModel = {
  async findAll(userId: string): Promise<Habit[]> {
    const result = await getDB().execute({
      sql: 'SELECT * FROM habits WHERE user_id = ? ORDER BY created_at DESC',
      args: [userId]
    })
    return result.rows.map(mapHabit)
  },

  async findById(id: string, userId: string): Promise<Habit | undefined> {
    const result = await getDB().execute({
      sql: 'SELECT * FROM habits WHERE id = ? AND user_id = ?',
      args: [id, userId]
    })
    if (result.rows.length === 0) return undefined
    return mapHabit(result.rows[0])
  },

  async findWithCompletions(userId: string): Promise<HabitWithCompletions[]> {
    const habits = await this.findAll(userId)
    const db = getDB()

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
    const startDate = sevenDaysAgo.toISOString().split('T')[0]

    return Promise.all(habits.map(async (habit) => {
      const result = await db.execute({
        sql: 'SELECT date FROM habit_completions WHERE habit_id = ? AND date >= ? ORDER BY date',
        args: [habit.id, startDate]
      })
      const completions = result.rows.map(row => row.date as string)

      return {
        ...habit,
        specific_days: habit.specific_days ? JSON.parse(habit.specific_days) : null,
        completions,
      }
    }))
  },

  async create(data: {
    user_id: string
    name: string
    frequency: 'daily' | 'specific'
    specific_days?: string[]
    category?: string
    goal_id?: string
  }): Promise<Habit> {
    const db = getDB()
    const id = crypto.randomUUID()
    await db.execute({
      sql: 'INSERT INTO habits (id, user_id, name, frequency, specific_days, category, goal_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [
        id,
        data.user_id,
        data.name,
        data.frequency,
        data.specific_days ? JSON.stringify(data.specific_days) : null,
        data.category || 'general',
        data.goal_id || null,
      ]
    })
    return (await this.findById(id, data.user_id))!
  },

  async update(id: string, userId: string, data: {
    name?: string
    frequency?: 'daily' | 'specific'
    specific_days?: string[]
    category?: string
    goal_id?: string | null
  }): Promise<Habit | undefined> {
    const db = getDB()
    const updates: string[] = []
    const values: any[] = []

    if (data.name !== undefined) { updates.push('name = ?'); values.push(data.name) }
    if (data.frequency !== undefined) { updates.push('frequency = ?'); values.push(data.frequency) }
    if (data.specific_days !== undefined) { updates.push('specific_days = ?'); values.push(JSON.stringify(data.specific_days)) }
    if (data.category !== undefined) { updates.push('category = ?'); values.push(data.category) }
    if (data.goal_id !== undefined) { updates.push('goal_id = ?'); values.push(data.goal_id) }

    if (updates.length === 0) return this.findById(id, userId)

    const sql = `UPDATE habits SET ${updates.join(', ')}, updated_at = datetime('now') WHERE id = ? AND user_id = ?`
    values.push(id, userId)
    await db.execute({ sql, args: values })
    return this.findById(id, userId)
  },

  async delete(id: string, userId: string): Promise<boolean> {
    await getDB().execute({ sql: 'DELETE FROM habits WHERE id = ? AND user_id = ?', args: [id, userId] })
    return true
  },

  async toggleCompletion(habitId: string, userId: string, date: string): Promise<{ completed: boolean }> {
    const db = getDB()

    const habit = await this.findById(habitId, userId)
    if (!habit) {
      throw new Error('Habit not found')
    }

    const checkResult = await db.execute({
      sql: 'SELECT id FROM habit_completions WHERE habit_id = ? AND date = ?',
      args: [habitId, date]
    })

    if (checkResult.rows.length > 0) {
      await db.execute({ sql: 'DELETE FROM habit_completions WHERE habit_id = ? AND date = ?', args: [habitId, date] })
      return { completed: false }
    } else {
      const id = crypto.randomUUID()
      await db.execute({ sql: 'INSERT INTO habit_completions (id, habit_id, date) VALUES (?, ?, ?)', args: [id, habitId, date] })
      return { completed: true }
    }
  },
}
