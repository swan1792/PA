/**
 * Initialize Turso tables and migrate data from local SQLite
 *
 * Usage:
 *   TURSO_DATABASE_URL=libsql://your-db.turso.io TURSO_AUTH_TOKEN=your-token npx tsx init-and-migrate.ts
 */

import { createClient } from '@libsql/client'
import initSqlJs from 'sql.js'
import fs from 'fs'
import path from 'path'

async function main() {
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN

  if (!tursoUrl) {
    console.error('Error: TURSO_DATABASE_URL environment variable is required')
    process.exit(1)
  }

  const turso = createClient({
    url: tursoUrl,
    authToken: tursoToken,
  })

  // Step 1: Create tables
  console.log('Creating tables in Turso...')

  await turso.execute(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )`)

  await turso.execute(`CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'todo' CHECK(status IN ('todo', 'in_progress', 'done')),
    priority TEXT DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high')),
    due_date TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`)

  await turso.execute(`CREATE TABLE IF NOT EXISTS habits (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    frequency TEXT NOT NULL DEFAULT 'daily' CHECK(frequency IN ('daily', 'specific')),
    specific_days TEXT,
    category TEXT NOT NULL DEFAULT 'general',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`)

  await turso.execute(`CREATE TABLE IF NOT EXISTS habit_completions (
    id TEXT PRIMARY KEY,
    habit_id TEXT NOT NULL,
    date TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(habit_id, date),
    FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
  )`)

  await turso.execute(`CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    content TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`)

  await turso.execute(`CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#7c3aed',
    icon TEXT DEFAULT '📁',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`)

  await turso.execute(`CREATE TABLE IF NOT EXISTS goals (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    target_date TEXT,
    status TEXT DEFAULT 'active' CHECK(status IN ('active','completed','abandoned')),
    progress INTEGER DEFAULT 0 CHECK(progress >= 0 AND progress <= 100),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`)

  await turso.execute(`CREATE TABLE IF NOT EXISTS moods (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    mood INTEGER NOT NULL CHECK(mood >= 1 AND mood <= 5),
    energy INTEGER NOT NULL CHECK(energy >= 1 AND energy <= 5),
    note TEXT,
    date TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, date),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`)

  await turso.execute(`CREATE TABLE IF NOT EXISTS focus_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    task_id TEXT,
    duration INTEGER NOT NULL DEFAULT 25,
    type TEXT DEFAULT 'focus' CHECK(type IN ('focus','break')),
    completed INTEGER DEFAULT 0,
    started_at TEXT DEFAULT (datetime('now')),
    ended_at TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL
  )`)

  await turso.execute(`CREATE TABLE IF NOT EXISTS journals (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT,
    content TEXT NOT NULL,
    mood INTEGER,
    date TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`)

  await turso.execute(`CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#7c3aed',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`)

  await turso.execute(`CREATE TABLE IF NOT EXISTS task_tags (
    task_id TEXT NOT NULL,
    tag_id TEXT NOT NULL,
    PRIMARY KEY (task_id, tag_id),
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
  )`)

  await turso.execute(`CREATE TABLE IF NOT EXISTS ideas (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    color TEXT DEFAULT '#fef3c7',
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`)

  await turso.execute(`CREATE TABLE IF NOT EXISTS reading_list (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    is_read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`)

  await turso.execute(`CREATE TABLE IF NOT EXISTS workouts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'strength',
    duration INTEGER,
    notes TEXT,
    date TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`)

  await turso.execute(`CREATE TABLE IF NOT EXISTS workout_sets (
    id TEXT PRIMARY KEY,
    workout_id TEXT NOT NULL,
    exercise TEXT NOT NULL,
    reps INTEGER,
    weight REAL,
    duration INTEGER,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE
  )`)

  await turso.execute(`CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`)

  await turso.execute(`CREATE TABLE IF NOT EXISTS achievements (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    condition_type TEXT NOT NULL,
    condition_value INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  )`)

  await turso.execute(`CREATE TABLE IF NOT EXISTS user_achievements (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    achievement_id TEXT NOT NULL,
    earned_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, achievement_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE
  )`)

  await turso.execute(`CREATE TABLE IF NOT EXISTS reminders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    time TEXT NOT NULL,
    days TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`)

  await turso.execute(`CREATE TABLE IF NOT EXISTS user_settings (
    user_id TEXT PRIMARY KEY,
    theme TEXT DEFAULT 'system',
    accent_color TEXT DEFAULT '#7c3aed',
    pin_hash TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`)

  // Add extra columns
  const alterStatements = [
    "ALTER TABLE tasks ADD COLUMN category_id TEXT",
    "ALTER TABLE tasks ADD COLUMN recurrence TEXT DEFAULT 'none'",
    "ALTER TABLE tasks ADD COLUMN recurrence_end_date TEXT",
    "ALTER TABLE tasks ADD COLUMN parent_task_id TEXT",
    "ALTER TABLE tasks ADD COLUMN goal_id TEXT",
    "ALTER TABLE habits ADD COLUMN goal_id TEXT",
  ]
  for (const sql of alterStatements) {
    try { await turso.execute(sql) } catch {}
  }

  console.log('Tables created successfully!')

  // Step 2: Migrate data
  const dbPath = path.join(__dirname, 'data', 'app.db')
  if (!fs.existsSync(dbPath)) {
    console.log('No local database found, skipping data migration')
    return
  }

  console.log('\nLoading local database...')
  const SQL = await initSqlJs()
  const buffer = fs.readFileSync(dbPath)
  const localDb = new SQL.Database(buffer)

  const tablesResult = localDb.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
  if (tablesResult.length === 0) {
    console.log('No tables found in local database')
    return
  }

  const tables = tablesResult[0].values.map(row => row[0] as string)
  console.log(`Found ${tables.length} tables to migrate`)

  for (const table of tables) {
    const columnsResult = localDb.exec(`PRAGMA table_info(${table})`)
    if (columnsResult.length === 0) continue
    const columns = columnsResult[0].values.map(row => row[1] as string)

    const rowsResult = localDb.exec(`SELECT * FROM ${table}`)
    if (rowsResult.length === 0) {
      console.log(`  ${table}: empty, skipping`)
      continue
    }

    const rows = rowsResult[0].values
    let inserted = 0
    for (const row of rows) {
      const placeholders = columns.map(() => '?').join(', ')
      const sql = `INSERT OR IGNORE INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`
      try {
        await turso.execute({ sql, args: row.map(v => v ?? null) })
        inserted++
      } catch (err: any) {
        console.error(`  ${table}: error - ${err.message}`)
      }
    }
    console.log(`  ${table}: ${inserted}/${rows.length} rows migrated`)
  }

  console.log('\nDone!')
  localDb.close()
}

main().catch(err => {
  console.error('Failed:', err)
  process.exit(1)
})
