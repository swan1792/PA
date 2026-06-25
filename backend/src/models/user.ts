import { getDB, saveDB } from '../db'

export interface User {
  id: string
  email: string
  name: string
  password_hash: string
  created_at: string
  updated_at: string
}

export const UserModel = {
  findByEmail(email: string): User | undefined {
    const db = getDB()
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?')
    stmt.bind([email])
    if (stmt.step()) {
      const values = stmt.get()
      stmt.free()
      return {
        id: values[0] as string,
        email: values[1] as string,
        name: values[2] as string,
        password_hash: values[3] as string,
        created_at: values[4] as string,
        updated_at: values[5] as string,
      }
    }
    stmt.free()
    return undefined
  },

  findById(id: string): Omit<User, 'password_hash'> | undefined {
    const db = getDB()
    const stmt = db.prepare('SELECT id, email, name, created_at, updated_at FROM users WHERE id = ?')
    stmt.bind([id])
    if (stmt.step()) {
      const values = stmt.get()
      stmt.free()
      return {
        id: values[0] as string,
        email: values[1] as string,
        name: values[2] as string,
        created_at: values[3] as string,
        updated_at: values[4] as string,
        password_hash: '',
      }
    }
    stmt.free()
    return undefined
  },

  create(data: { id: string; email: string; name: string; password_hash: string }): User {
    const db = getDB()
    db.run(
      'INSERT INTO users (id, email, name, password_hash) VALUES (?, ?, ?, ?)',
      [data.id, data.email, data.name, data.password_hash]
    )
    saveDB()
    return {
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  },
}
