const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  // Database errors
  if (err.code === '23505') {
    // Unique constraint violation
    return res.status(409).json({
      error: 'Resource already exists',
      details: err.detail,
    });
  }

  if (err.code === '23503') {
    // Foreign key violation
    return res.status(400).json({
      error: 'Invalid reference',
      details: err.detail,
    });
  }

  if (err.code === '22P02') {
    // Invalid text representation
    return res.status(400).json({
      error: 'Invalid input format',
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.errors,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expired',
    });
  }

  // Solana errors
  if (err.message && err.message.includes('Solana')) {
    return res.status(503).json({
      error: 'Blockchain service unavailable',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }

  // Default error response
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};


const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};


class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  errorHandler,
  asyncHandler,
  AppError,
};