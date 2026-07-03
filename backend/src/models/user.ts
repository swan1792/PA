import { getDB } from '../db'

export interface User {
  id: string
  email: string
  name: string
  password_hash: string
  created_at: string
  updated_at: string
}

export const UserModel = {
  async findByEmail(email: string): Promise<User | undefined> {
    const db = getDB()
    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE email = ?',
      args: [email]
    })
    if (result.rows.length === 0) return undefined
    const row = result.rows[0]
    return {
      id: row.id as string,
      email: row.email as string,
      name: row.name as string,
      password_hash: row.password_hash as string,
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
    }
  },

  async findById(id: string): Promise<Omit<User, 'password_hash'> | undefined> {
    const db = getDB()
    const result = await db.execute({
      sql: 'SELECT id, email, name, created_at, updated_at FROM users WHERE id = ?',
      args: [id]
    })
    if (result.rows.length === 0) return undefined
    const row = result.rows[0]
    return {
      id: row.id as string,
      email: row.email as string,
      name: row.name as string,
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
    } as Omit<User, 'password_hash'>
  },

  async create(data: { id: string; email: string; name: string; password_hash: string }): Promise<User> {
    const db = getDB()
    await db.execute({
      sql: 'INSERT INTO users (id, email, name, password_hash) VALUES (?, ?, ?, ?)',
      args: [data.id, data.email, data.name, data.password_hash]
    })
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      password_hash: data.password_hash,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  },
}
