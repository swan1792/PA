import { getDB } from '../db'

export interface Workout { id: string; user_id: string; name: string; type: string; duration: number | null; notes: string | null; date: string; created_at: string }
export interface WorkoutSet { id: string; workout_id: string; exercise: string; reps: number | null; weight: number | null; duration: number | null; created_at: string }

export const WorkoutModel = {
  async findAll(userId: string, limit = 30): Promise<Workout[]> {
    const result = await getDB().execute({
      sql: 'SELECT * FROM workouts WHERE user_id = ? ORDER BY date DESC LIMIT ?',
      args: [userId, limit]
    })
    return result.rows.map(row => ({
      id: row.id as string,
      user_id: row.user_id as string,
      name: row.name as string,
      type: row.type as string,
      duration: row.duration as number | null,
      notes: row.notes as string | null,
      date: row.date as string,
      created_at: row.created_at as string,
    }))
  },

  async findById(id: string, userId: string): Promise<Workout | undefined> {
    const result = await getDB().execute({
      sql: 'SELECT * FROM workouts WHERE id = ? AND user_id = ?',
      args: [id, userId]
    })
    if (result.rows.length === 0) return undefined
    const row = result.rows[0]
    return {
      id: row.id as string,
      user_id: row.user_id as string,
      name: row.name as string,
      type: row.type as string,
      duration: row.duration as number | null,
      notes: row.notes as string | null,
      date: row.date as string,
      created_at: row.created_at as string,
    }
  },

  async create(data: { user_id: string; name: string; type?: string; duration?: number; notes?: string; date: string }): Promise<Workout> {
    const db = getDB()
    const id = crypto.randomUUID()
    await db.execute({
      sql: 'INSERT INTO workouts (id, user_id, name, type, duration, notes, date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [id, data.user_id, data.name, data.type || 'strength', data.duration || null, data.notes || null, data.date]
    })
    return (await this.findById(id, data.user_id))!
  },

  async delete(id: string, userId: string): Promise<boolean> {
    const db = getDB()
    await db.execute({ sql: 'DELETE FROM workout_sets WHERE workout_id = ?', args: [id] })
    await db.execute({ sql: 'DELETE FROM workouts WHERE id = ? AND user_id = ?', args: [id, userId] })
    return true
  },

  async addSet(workoutId: string, data: { exercise: string; reps?: number; weight?: number; duration?: number }): Promise<WorkoutSet> {
    const db = getDB()
    const id = crypto.randomUUID()
    await db.execute({
      sql: 'INSERT INTO workout_sets (id, workout_id, exercise, reps, weight, duration) VALUES (?, ?, ?, ?, ?, ?)',
      args: [id, workoutId, data.exercise, data.reps || null, data.weight || null, data.duration || null]
    })
    const result = await getDB().execute({ sql: 'SELECT * FROM workout_sets WHERE id = ?', args: [id] })
    const row = result.rows[0]
    return {
      id: row.id as string,
      workout_id: row.workout_id as string,
      exercise: row.exercise as string,
      reps: row.reps as number | null,
      weight: row.weight as number | null,
      duration: row.duration as number | null,
      created_at: row.created_at as string,
    }
  },

  async getSets(workoutId: string): Promise<WorkoutSet[]> {
    const result = await getDB().execute({
      sql: 'SELECT * FROM workout_sets WHERE workout_id = ? ORDER BY created_at',
      args: [workoutId]
    })
    return result.rows.map(row => ({
      id: row.id as string,
      workout_id: row.workout_id as string,
      exercise: row.exercise as string,
      reps: row.reps as number | null,
      weight: row.weight as number | null,
      duration: row.duration as number | null,
      created_at: row.created_at as string,
    }))
  },

  async getStats(userId: string) {
    const result = await getDB().execute({
      sql: "SELECT COUNT(*) as count FROM workouts WHERE user_id = ? AND date >= date('now', '-7 days')",
      args: [userId]
    })
    return { weekWorkouts: Number(result.rows[0]?.count) || 0 }
  },
}
