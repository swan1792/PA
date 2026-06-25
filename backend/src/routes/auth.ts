import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { UserModel } from '../models/user'
import { AppError } from '../middleware/errorHandler'
import { asyncHandler } from '../utils/asyncHandler'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(6),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

router.post('/register', asyncHandler(async (req: Request, res: Response) => {
  const { email, name, password } = registerSchema.parse(req.body)

  // Check if user exists
  const existing = UserModel.findByEmail(email)
  if (existing) {
    throw new AppError('Email already registered', 400)
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10)
  const id = crypto.randomUUID()

  // Create user
  UserModel.create({ id, email, name, password_hash: passwordHash })

  // Generate token
  const token = jwt.sign({ userId: id }, JWT_SECRET, { expiresIn: '7d' })

  res.status(201).json({
    data: {
      user: { id, email, name },
      token,
    },
  })
}))

router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = loginSchema.parse(req.body)

  // Find user
  const user = UserModel.findByEmail(email)
  if (!user) {
    throw new AppError('Invalid credentials', 401)
  }

  // Verify password
  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) {
    throw new AppError('Invalid credentials', 401)
  }

  // Generate token
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })

  res.json({
    data: {
      user: { id: user.id, email: user.email, name: user.name },
      token,
    },
  })
}))

export { router as authRoutes }
