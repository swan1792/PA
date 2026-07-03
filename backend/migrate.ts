/**
 * Migration script: Copy data from local SQLite (app.db) to Turso
 *
 * Usage:
 *   TURSO_DATABASE_URL=libsql://your-db.turso.io TURSO_AUTH_TOKEN=your-token npx tsx migrate.ts
 */

import initSqlJs from 'sql.js'
import { createClient } from '@libsql/client'
import fs from 'fs'
import path from 'path'

async function migrate() {
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN

  if (!tursoUrl) {
    console.error('Error: TURSO_DATABASE_URL environment variable is required')
    process.exit(1)
  }

  const dbPath = path.join(__dirname, 'data', 'app.db')
  if (!fs.existsSync(dbPath)) {
    console.error('Error: Local database not found at', dbPath)
    process.exit(1)
  }

  console.log('Loading local database...')
  const SQL = await initSqlJs()
  const buffer = fs.readFileSync(dbPath)
  const localDb = new SQL.Database(buffer)

  console.log('Connecting to Turso...')
  const turso = createClient({
    url: tursoUrl,
    authToken: tursoToken,
  })

  // Get all tables
  const tablesResult = localDb.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
  if (tablesResult.length === 0) {
    console.log('No tables found in local database')
    process.exit(0)
  }

  const tables = tablesResult[0].values.map(row => row[0] as string)
  console.log(`Found ${tables.length} tables: ${tables.join(', ')}`)

  for (const table of tables) {
    console.log(`\nMigrating table: ${table}`)

    // Get column info
    const columnsResult = localDb.exec(`PRAGMA table_info(${table})`)
    if (columnsResult.length === 0) continue
    const columns = columnsResult[0].values.map(row => row[1] as string)

    // Get all rows
    const rowsResult = localDb.exec(`SELECT * FROM ${table}`)
    if (rowsResult.length === 0) {
      console.log(`  Table ${table} is empty, skipping`)
      continue
    }

    const rows = rowsResult[0].values
    console.log(`  Found ${rows.length} rows`)

    // Insert rows into Turso
    let inserted = 0
    for (const row of rows) {
      const placeholders = columns.map(() => '?').join(', ')
      const sql = `INSERT OR IGNORE INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`
      try {
        await turso.execute({ sql, args: row.map(v => v ?? null) })
        inserted++
      } catch (err: any) {
        console.error(`  Error inserting row into ${table}:`, err.message)
      }
    }
    console.log(`  Inserted ${inserted}/${rows.length} rows`)
  }

  console.log('\nMigration complete!')
  localDb.close()
}

migrate().catch(err => {
  console.error('Migration failed:', err)
  process.exit(1)
})
