import { Request, Response, NextFunction } from 'express';

interface ErrorWithStatus extends Error {
  statusCode?: number;
  code?: number;
  keyValue?: Record<string, any>;
  errors?: Record<string, { message: string }>;
}

const errorHandler = (
  err: ErrorWithStatus,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err.stack);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors: Record<string, string> = {};
    if (err.errors) {
      Object.keys(err.errors).forEach((key) => {
        errors[key] = err.errors?.[key]?.message || 'Invalid field';
      });
    }
    return res.status(statusCode).json({
      success: false,
      message: 'Validation Error',
      errors,
    });
  }

  // Handle duplicate key errors
  if (err.code === 11000) {
    statusCode = 400;
    const field = err.keyValue ? Object.keys(err.keyValue)[0] : 'field';
    message = `${field} already exists`;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export { errorHandler };
