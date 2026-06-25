import { getDB, saveDB } from '../db'

export interface Habit {
  id: string
  user_id: string
  name: string
  frequency: 'daily' | 'specific'
  specific_days: string | null   // JSON array string, e.g. '["mon","wed","fri"]'
  category: string
  goal_id: string | null
  created_at: string
  updated_at: string
}

export interface HabitWithCompletions extends Omit<Habit, 'specific_days'> {
  specific_days: string[] | null
  completions: string[]          // array of 'YYYY-MM-DD' dates (last 7 days)
}

function mapRow(stmt: any): Habit | null {
  if (stmt.step()) {
    const values = stmt.get()
    stmt.free()
    return {
      id: values[0] as string,
      user_id: values[1] as string,
      name: values[2] as string,
      frequency: values[3] as Habit['frequency'],
      specific_days: values[4] as string | null,
      category: values[5] as string,
      goal_id: values[6] as string | null,
      created_at: values[7] as string,
      updated_at: values[8] as string,
    }
  }
  stmt.free()
  return null
}

function mapRows(stmt: any): Habit[] {
  const results: Habit[] = []
  while (stmt.step()) {
    const values = stmt.get()
    results.push({
      id: values[0] as string,
      user_id: values[1] as string,
      name: values[2] as string,
      frequency: values[3] as Habit['frequency'],
      specific_days: values[4] as string | null,
      category: values[5] as string,
      goal_id: values[6] as string | null,
      created_at: values[7] as string,
      updated_at: values[8] as string,
    })
  }
  stmt.free()
  return results
}

export const HabitModel = {
  findAll(userId: string): Habit[] {
    const db = getDB()
    const stmt = db.prepare('SELECT * FROM habits WHERE user_id = ? ORDER BY created_at DESC')
    stmt.bind([userId])
    return mapRows(stmt)
  },

  findById(id: string, userId: string): Habit | undefined {
    const db = getDB()
    const stmt = db.prepare('SELECT * FROM habits WHERE id = ? AND user_id = ?')
    stmt.bind([id, userId])
    return mapRow(stmt) || undefined
  },

  findWithCompletions(userId: string): HabitWithCompletions[] {
    const habits = this.findAll(userId)
    const db = getDB()

    // Get the date 7 days ago
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
    const startDate = sevenDaysAgo.toISOString().split('T')[0]

    return habits.map((habit) => {
      const stmt = db.prepare(
        'SELECT date FROM habit_completions WHERE habit_id = ? AND date >= ? ORDER BY date'
      )
      stmt.bind([habit.id, startDate])
      const completions: string[] = []
      while (stmt.step()) {
        completions.push(stmt.get()[0] as string)
      }
      stmt.free()

      return {
        ...habit,
        specific_days: habit.specific_days ? JSON.parse(habit.specific_days) : null,
        completions,
      }
    })
  },

  create(data: {
    user_id: string
    name: string
    frequency: 'daily' | 'specific'
    specific_days?: string[]
    category?: string
    goal_id?: string
  }): Habit {
    const db = getDB()
    const id = crypto.randomUUID()
    db.run(
      'INSERT INTO habits (id, user_id, name, frequency, specific_days, category, goal_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        id,
        data.user_id,
        data.name,
        data.frequency,
        data.specific_days ? JSON.stringify(data.specific_days) : null,
        data.category || 'general',
        data.goal_id || null,
      ]
    )
    saveDB()
    return this.findById(id, data.user_id)!
  },

  update(id: string, userId: string, data: {
    name?: string
    frequency?: 'daily' | 'specific'
    specific_days?: string[]
    category?: string
    goal_id?: string | null
  }): Habit | undefined {
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
    db.run(sql, values)
    saveDB()
    return this.findById(id, userId)
  },

  delete(id: string, userId: string): boolean {
    const db = getDB()
    // Completions cascade-delete via FK
    db.run('DELETE FROM habits WHERE id = ? AND user_id = ?', [id, userId])
    saveDB()
    return true
  },

  toggleCompletion(habitId: string, userId: string, date: string): { completed: boolean } {
    const db = getDB()

    // Verify the habit belongs to the user
    const habit = this.findById(habitId, userId)
    if (!habit) {
      throw new Error('Habit not found')
    }

    // Check if completion exists
    const stmt = db.prepare('SELECT id FROM habit_completions WHERE habit_id = ? AND date = ?')
    stmt.bind([habitId, date])
    const exists = stmt.step()
    stmt.free()

    if (exists) {
      // Remove completion
      db.run('DELETE FROM habit_completions WHERE habit_id = ? AND date = ?', [habitId, date])
      saveDB()
      return { completed: false }
    } else {
      // Add completion
      const id = crypto.randomUUID()
      db.run('INSERT INTO habit_completions (id, habit_id, date) VALUES (?, ?, ?)', [id, habitId, date])
      saveDB()
      return { completed: true }
    }
  },
}
