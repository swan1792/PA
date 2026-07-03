import { getDB } from '../db'

export interface Achievement { id: string; name: string; description: string; icon: string; condition_type: string; condition_value: number; created_at: string }
export interface UserAchievement { id: string; user_id: string; achievement_id: string; earned_at: string }

export async function seedAchievements() {
  const db = getDB()
  const countResult = await db.execute('SELECT COUNT(*) as count FROM achievements')
  if (Number(countResult.rows[0]?.count) > 0) return

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

  for (const a of achievements) {
    await db.execute({
      sql: 'INSERT INTO achievements (id, name, description, icon, condition_type, condition_value) VALUES (?, ?, ?, ?, ?, ?)',
      args: [crypto.randomUUID(), a.name, a.desc, a.icon, a.type, a.value]
    })
  }
}

export const AchievementModel = {
  async getAll(): Promise<Achievement[]> {
    const result = await getDB().execute('SELECT * FROM achievements ORDER BY condition_value')
    return result.rows.map(row => ({
      id: row.id as string,
      name: row.name as string,
      description: row.description as string,
      icon: row.icon as string,
      condition_type: row.condition_type as string,
      condition_value: row.condition_value as number,
      created_at: row.created_at as string,
    }))
  },

  async getUserAchievements(userId: string): Promise<Achievement[]> {
    const result = await getDB().execute({
      sql: 'SELECT a.* FROM achievements a JOIN user_achievements ua ON a.id = ua.achievement_id WHERE ua.user_id = ? ORDER BY ua.earned_at DESC',
      args: [userId]
    })
    return result.rows.map(row => ({
      id: row.id as string,
      name: row.name as string,
      description: row.description as string,
      icon: row.icon as string,
      condition_type: row.condition_type as string,
      condition_value: row.condition_value as number,
      created_at: row.created_at as string,
    }))
  },

  async checkAndAward(userId: string): Promise<Achievement[]> {
    const db = getDB()
    const allAchievements = await this.getAll()
    const earned = new Set((await this.getUserAchievements(userId)).map(a => a.id))
    const newlyEarned: Achievement[] = []

    const countQuery = async (sql: string, params: any[]): Promise<number> => {
      const result = await db.execute({ sql, args: params })
      return Number(result.rows[0]?.[Object.keys(result.rows[0])[0]]) || 0
    }

    const stats = {
      tasks_completed: await countQuery('SELECT COUNT(*) FROM tasks WHERE user_id = ? AND status = ?', [userId, 'done']),
      focus_sessions: await countQuery('SELECT COUNT(*) FROM focus_sessions WHERE user_id = ? AND completed = 1', [userId]),
      goals_created: await countQuery('SELECT COUNT(*) FROM goals WHERE user_id = ?', [userId]),
      goals_completed: await countQuery('SELECT COUNT(*) FROM goals WHERE user_id = ? AND status = ?', [userId, 'completed']),
      journal_entries: await countQuery('SELECT COUNT(*) FROM journals WHERE user_id = ?', [userId]),
      reading_items: await countQuery('SELECT COUNT(*) FROM reading_list WHERE user_id = ?', [userId]),
      workouts_logged: await countQuery('SELECT COUNT(*) FROM workouts WHERE user_id = ?', [userId]),
      expenses_tracked: await countQuery('SELECT COUNT(*) FROM expenses WHERE user_id = ?', [userId]),
      mood_entries: await countQuery('SELECT COUNT(*) FROM moods WHERE user_id = ?', [userId]),
      habit_streak: 0,
    }

    for (const achievement of allAchievements) {
      if (earned.has(achievement.id)) continue
      const current = stats[achievement.condition_type as keyof typeof stats] || 0
      if (current >= achievement.condition_value) {
        await db.execute({
          sql: 'INSERT OR IGNORE INTO user_achievements (id, user_id, achievement_id) VALUES (?, ?, ?)',
          args: [crypto.randomUUID(), userId, achievement.id]
        })
        newlyEarned.push(achievement)
      }
    }

    return newlyEarned
  },
}
