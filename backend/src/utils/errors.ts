import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string, name = 'ApiError') {
    super(message);
    this.statusCode = statusCode;
    this.name = name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Create a 400 Bad Request error
 */
export const badRequest = (message = 'Bad Request') => {
  return new ApiError(400, message, 'BadRequest');
};

/**
 * Create a 401 Unauthorized error
 */
export const unauthorized = (message = 'Unauthorized') => {
  return new ApiError(401, message, 'Unauthorized');
};

/**
 * Create a 403 Forbidden error
 */
export const forbidden = (message = 'Forbidden') => {
  return new ApiError(403, message, 'Forbidden');
};

/**
 * Create a 404 Not Found error
 */
export const notFound = (message = 'Resource not found') => {
  return new ApiError(404, message, 'NotFound');
};

/**
 * Create a 409 Conflict error
 */
export const conflict = (message = 'Conflict') => {
  return new ApiError(409, message, 'Conflict');
};

/**
 * Create a 500 Internal Server Error
 */
export const internalError = (message = 'Internal Server Error') => {
  return new ApiError(500, message, 'InternalError');
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export const asyncHandler = (fn: RequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default {
  ApiError,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  internalError,
  asyncHandler,
};
