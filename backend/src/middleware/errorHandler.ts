import { Request, Response, NextFunction } from 'express'

export class AppError extends Error {
  statusCode: number
  details?: string[]

  constructor(message: string, statusCode: number, details?: string[]) {
    super(message)
    this.statusCode = statusCode
    this.details = details
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', err)

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      details: err.details,
    })
  }

  res.status(500).json({
    error: 'Internal server error',
  })
}
