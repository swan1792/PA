import { getDB, saveDB } from '../db'

export interface Achievement { id: string; name: string; description: string; icon: string; condition_type: string; condition_value: number; created_at: string }
export interface UserAchievement { id: string; user_id: string; achievement_id: string; earned_at: string }

// Seed default achievements
export function seedAchievements() {
  const db = getDB()
  const count = db.exec('SELECT COUNT(*) FROM achievements')
  if (count[0]?.values[0]?.[0] > 0) return

  const achievements = [
    { name: 'First Step', desc: 'Complete your first task', icon: '👣', type: 'tasks_completed', value: 1 },
    { name: 'Task Master', desc: 'Complete 10 tasks', icon: '✅', type: 'tasks_completed', value: 10 },
    { name: 'Century Club', desc: 'Complete 100 tasks', icon: '💯', type: 'tasks_completed', value: 100 },
    { name: 'Habit Starter', desc: 'Complete a habit 3 days in a row', icon: '🌱', type: 'habit_streak', value: 3 },
    { name: 'Habit Pro', desc: 'Complete a habit 7 days in a row', icon: '🔥', type: 'habit_streak', value: 7 },
    { name: 'Habit Legend', desc: 'Complete a habit 30 days in a row', icon: '🏆', type: 'habit_streak', value: 30 },
    { name: 'Focused', desc: 'Complete 5 focus sessions', icon: '🎯', type: 'focus_sessions', value: 5 },
    { name: 'Deep Work', desc: 'Complete 25 focus sessions', icon: '🧠', type: 'focus_sessions', value: 25 },
    { name: 'Goal Setter', desc: 'Create your first goal', icon: '🎯', type: 'goals_created', value: 1 },
    { name: 'Goal Achiever', desc: 'Complete a goal', icon: '🏅', type: 'goals_completed', value: 1 },
    { name: 'Journalist', desc: 'Write 7 journal entries', icon: '📝', type: 'journal_entries', value: 7 },
    { name: 'Bookworm', desc: 'Add 5 items to reading list', icon: '📚', type: 'reading_items', value: 5 },
    { name: 'Fitness Enthusiast', desc: 'Log 10 workouts', icon: '💪', type: 'workouts_logged', value: 10 },
    { name: 'Budget Master', desc: 'Track 50 expenses', icon: '💰', type: 'expenses_tracked', value: 50 },
    { name: 'Mood Tracker', desc: 'Log mood for 7 days', icon: '😊', type: 'mood_entries', value: 7 },
  ]

  achievements.forEach(a => {
    db.run('INSERT INTO achievements (id, name, description, icon, condition_type, condition_value) VALUES (?, ?, ?, ?, ?, ?)',
      [crypto.randomUUID(), a.name, a.desc, a.icon, a.type, a.value])
  })
  saveDB()
}

export const AchievementModel = {
  getAll(): Achievement[] {
    const stmt = getDB().prepare('SELECT * FROM achievements ORDER BY condition_value')
    const results: Achievement[] = []
    while (stmt.step()) { const v = stmt.get(); results.push({ id: v[0], name: v[1], description: v[2], icon: v[3], condition_type: v[4], condition_value: v[5], created_at: v[6] }) }
    stmt.free()
    return results
  },

  getUserAchievements(userId: string): Achievement[] {
    const stmt = getDB().prepare('SELECT a.* FROM achievements a JOIN user_achievements ua ON a.id = ua.achievement_id WHERE ua.user_id = ? ORDER BY ua.earned_at DESC')
    stmt.bind([userId])
    const results: Achievement[] = []
    while (stmt.step()) { const v = stmt.get(); results.push({ id: v[0], name: v[1], description: v[2], icon: v[3], condition_type: v[4], condition_value: v[5], created_at: v[6] }) }
    stmt.free()
    return results
  },

  checkAndAward(userId: string) {
    const db = getDB()
    const allAchievements = this.getAll()
    const earned = new Set(this.getUserAchievements(userId).map(a => a.id))
    const newlyEarned: Achievement[] = []

    // Count user stats
    const countQuery = (sql: string, params: any[]): number => {
      const stmt = db.prepare(sql)
      stmt.bind(params)
      let count = 0
      if (stmt.step()) count = (stmt.get()[0] as number) || 0
      stmt.free()
      return count
    }

    const stats = {
      tasks_completed: countQuery('SELECT COUNT(*) FROM tasks WHERE user_id = ? AND status = ?', [userId, 'done']),
      focus_sessions: countQuery('SELECT COUNT(*) FROM focus_sessions WHERE user_id = ? AND completed = 1', [userId]),
      goals_created: countQuery('SELECT COUNT(*) FROM goals WHERE user_id = ?', [userId]),
      goals_completed: countQuery('SELECT COUNT(*) FROM goals WHERE user_id = ? AND status = ?', [userId, 'completed']),
      journal_entries: countQuery('SELECT COUNT(*) FROM journals WHERE user_id = ?', [userId]),
      reading_items: countQuery('SELECT COUNT(*) FROM reading_list WHERE user_id = ?', [userId]),
      workouts_logged: countQuery('SELECT COUNT(*) FROM workouts WHERE user_id = ?', [userId]),
      expenses_tracked: countQuery('SELECT COUNT(*) FROM expenses WHERE user_id = ?', [userId]),
      mood_entries: countQuery('SELECT COUNT(*) FROM moods WHERE user_id = ?', [userId]),
      habit_streak: 0, // Simplified
    }

    allAchievements.forEach(achievement => {
      if (earned.has(achievement.id)) return
      const current = stats[achievement.condition_type as keyof typeof stats] || 0
      if (current >= achievement.condition_value) {
        db.run('INSERT OR IGNORE INTO user_achievements (id, user_id, achievement_id) VALUES (?, ?, ?)',
          [crypto.randomUUID(), userId, achievement.id])
        newlyEarned.push(achievement)
      }
    })

    if (newlyEarned.length > 0) saveDB()
    return newlyEarned
  },
}
