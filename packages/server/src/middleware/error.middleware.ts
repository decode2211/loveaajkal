import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorMiddleware(err: Error, req: Request, res: Response, _next: NextFunction) {
  console.error(`[Error] ${req.method} ${req.path}:`, err.message);

  if (err instanceof ZodError) {
    res.status(400).json({
      message: 'Validation error',
      errors: err.flatten().fieldErrors,
    });
    return;
  }

  const status = (err as { status?: number }).status || 500;
  res.status(status).json({
    message: err.message || 'Internal server error',
  });
}
