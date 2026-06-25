import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { verifyGoogleToken, generateAppToken } from '../utils/googleAuth'
import { UserModel } from '../models/user'
import { AppError } from '../middleware/errorHandler'

const router = Router()

const googleLoginSchema = z.object({
  idToken: z.string().min(1, 'Google ID token is required'),
})

const googleWebLoginSchema = z.object({
  credential: z.string().min(1, 'Google credential is required'),
})

/**
 * POST /api/auth/google
 * Mobile flow: Receive Google ID token from client
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idToken } = googleLoginSchema.parse(req.body)

    // Verify the Google token
    const googleUser = await verifyGoogleToken(idToken)

    if (!googleUser.verified_email) {
      throw new AppError('Google email not verified', 400)
    }

    // Check if user exists
    let user = UserModel.findByEmail(googleUser.email)

    if (!user) {
      // Create new user
      const userId = crypto.randomUUID()
      UserModel.create({
        id: userId,
        email: googleUser.email,
        name: googleUser.name,
        password_hash: '', // No password for Google users
      })
      user = UserModel.findByEmail(googleUser.email)
    }

    // Generate app token
    const token = generateAppToken(user!.id)

    res.json({
      data: {
        user: {
          id: user!.id,
          email: user!.email,
          name: user!.name,
        },
        token,
      },
    })
  } catch (error: any) {
    if (error instanceof AppError) {
      return next(error)
    }
    next(new AppError('Google authentication failed: ' + error.message, 401))
  }
})

/**
 * POST /api/auth/google/web
 * Web flow: Receive credential (ID token) from Google One Tap / Sign-In button
 */
router.post('/web', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { credential } = googleWebLoginSchema.parse(req.body)

    // Verify the Google token
    const googleUser = await verifyGoogleToken(credential)

    if (!googleUser.verified_email) {
      throw new AppError('Google email not verified', 400)
    }

    // Check if user exists
    let user = UserModel.findByEmail(googleUser.email)

    if (!user) {
      // Create new user
      const userId = crypto.randomUUID()
      UserModel.create({
        id: userId,
        email: googleUser.email,
        name: googleUser.name,
        password_hash: '', // No password for Google users
      })
      user = UserModel.findByEmail(googleUser.email)
    }

    // Generate app token
    const token = generateAppToken(user!.id)

    res.json({
      data: {
        user: {
          id: user!.id,
          email: user!.email,
          name: user!.name,
        },
        token,
      },
    })
  } catch (error: any) {
    if (error instanceof AppError) {
      return next(error)
    }
    next(new AppError('Google authentication failed: ' + error.message, 401))
  }
})

export { router as googleAuthRoutes }
