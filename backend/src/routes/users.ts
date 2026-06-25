import { Router, Response } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth'
import { UserModel } from '../models/user'

const router = Router()

router.get('/me', authenticate, (req: AuthRequest, res: Response) => {
  const user = UserModel.findById(req.userId!)

  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  res.json({
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.created_at,
    },
  })
})

export { router as userRoutes }
