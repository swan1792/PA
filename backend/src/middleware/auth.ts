import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AppError } from './errorHandler'
import { UserModel } from '../models/user'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface AuthRequest extends Request {
  userId?: string
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('No token provided', 401)
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    req.userId = decoded.userId

    // Verify the user still exists in the database.
    // Prevents FOREIGN KEY constraint failures when the DB was reset
    // but the client still holds a valid-signed JWT from before the reset.
    UserModel.findById(decoded.userId)
      .then(user => {
        if (!user) {
          return next(new AppError('User not found. Please log in again.', 401))
        }
        next()
      })
      .catch(err => {
        next(new AppError('Authentication error', 500))
      })
  } catch (error) {
    throw new AppError('Invalid token', 401)
  }
}
