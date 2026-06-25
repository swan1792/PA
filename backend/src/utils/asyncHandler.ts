import { Request, Response, NextFunction } from 'express'

/**
 * Wraps an async route handler so thrown errors are forwarded to Express's
 * error handler instead of becoming unhandled rejections.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next)
  }
}
