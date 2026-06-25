import { getDB, saveDB } from '../db'

export interface Workout { id: string; user_id: string; name: string; type: string; duration: number | null; notes: string | null; date: string; created_at: string }
export interface WorkoutSet { id: string; workout_id: string; exercise: string; reps: number | null; weight: number | null; duration: number | null; created_at: string }

function mapWorkouts(stmt: any): Workout[] {
  const results: Workout[] = []
  while (stmt.step()) { const v = stmt.get(); results.push({ id: v[0], user_id: v[1], name: v[2], type: v[3], duration: v[4], notes: v[5], date: v[6], created_at: v[7] }) }
  stmt.free()
  return results
}

function mapSets(stmt: any): WorkoutSet[] {
  const results: WorkoutSet[] = []
  while (stmt.step()) { const v = stmt.get(); results.push({ id: v[0], workout_id: v[1], exercise: v[2], reps: v[3], weight: v[4], duration: v[5], created_at: v[6] }) }
  stmt.free()
  return results
}

export const WorkoutModel = {
  findAll(userId: string, limit = 30): Workout[] {
    const stmt = getDB().prepare('SELECT * FROM workouts WHERE user_id = ? ORDER BY date DESC LIMIT ?')
    stmt.bind([userId, limit])
    return mapWorkouts(stmt)
  },

  findById(id: string, userId: string): Workout | undefined {
    const stmt = getDB().prepare('SELECT * FROM workouts WHERE id = ? AND user_id = ?')
    stmt.bind([id, userId])
    const r = mapWorkouts(stmt)
    return r[0]
  },

  create(data: { user_id: string; name: string; type?: string; duration?: number; notes?: string; date: string }): Workout {
    const db = getDB(); const id = crypto.randomUUID()
    db.run('INSERT INTO workouts (id, user_id, name, type, duration, notes, date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, data.user_id, data.name, data.type || 'strength', data.duration || null, data.notes || null, data.date])
    saveDB()
    return this.findById(id, data.user_id)!
  },

  delete(id: string, userId: string): boolean {
    const db = getDB()
    db.run('DELETE FROM workout_sets WHERE workout_id = ?', [id])
    db.run('DELETE FROM workouts WHERE id = ? AND user_id = ?', [id, userId])
    saveDB()
    return true
  },

  addSet(workoutId: string, data: { exercise: string; reps?: number; weight?: number; duration?: number }): WorkoutSet {
    const db = getDB(); const id = crypto.randomUUID()
    db.run('INSERT INTO workout_sets (id, workout_id, exercise, reps, weight, duration) VALUES (?, ?, ?, ?, ?, ?)',
      [id, workoutId, data.exercise, data.reps || null, data.weight || null, data.duration || null])
    saveDB()
    const stmt = getDB().prepare('SELECT * FROM workout_sets WHERE id = ?')
    stmt.bind([id])
    return mapSets(stmt)[0]
  },

  getSets(workoutId: string): WorkoutSet[] {
    const stmt = getDB().prepare('SELECT * FROM workout_sets WHERE workout_id = ? ORDER BY created_at')
    stmt.bind([workoutId])
    return mapSets(stmt)
  },

  getStats(userId: string) {
    const db = getDB()
    const stmt = db.prepare("SELECT COUNT(*) FROM workouts WHERE user_id = ? AND date >= date('now', '-7 days')")
    stmt.bind([userId])
    let weekWorkouts = 0
    if (stmt.step()) { weekWorkouts = stmt.get()[0] as number }
    stmt.free()
    return { weekWorkouts }
  },
}
