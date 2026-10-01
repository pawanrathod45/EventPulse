import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  public statusCode: number;
  public details?: any;

  constructor(message: string, statusCode = 400, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || (err.status ? Number(err.status) : 500);
  const message = err.message || 'Internal Server Error';

  console.error(`[API Error] ${statusCode} - ${message}`, err.details || err.stack || '');

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code: err.name || 'API_ERROR',
      details: err.details || undefined,
    },
  });
};
