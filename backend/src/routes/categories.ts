import { Router, Response } from 'express'
import { z } from 'zod'
import { authenticate, AuthRequest } from '../middleware/auth'
import { CategoryModel } from '../models/category'
import { AppError } from '../middleware/errorHandler'
import { asyncHandler } from '../utils/asyncHandler'

const router = Router()

const createCategorySchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  icon: z.string().max(10).optional(),
})

const updateCategorySchema = z.object({
  name: z.string().min(1).max(50).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  icon: z.string().max(10).optional(),
})

// Get all categories
router.get('/', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const categories = await CategoryModel.findAll(req.userId!)
  res.json({ data: categories })
}))

// Create category
router.post('/', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = createCategorySchema.parse(req.body)
  const category = await CategoryModel.create({
    user_id: req.userId!,
    name: data.name,
    color: data.color,
    icon: data.icon,
  })
  res.status(201).json({ data: category })
}))

// Update category
router.put('/:id', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = updateCategorySchema.parse(req.body)
  const category = await CategoryModel.update(req.params.id, req.userId!, data)
  if (!category) throw new AppError('Category not found', 404)
  res.json({ data: category })
}))

// Delete category
router.delete('/:id', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const deleted = await CategoryModel.delete(req.params.id, req.userId!)
  if (!deleted) throw new AppError('Category not found', 404)
  res.json({ success: true })
}))

export { router as categoryRoutes }
