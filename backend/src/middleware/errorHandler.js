import { AppError } from '../errors/AppError.js';

export function errorHandler(err, _req, res, _next) {
  if (err instanceof AppError) {
    const body = { error: { message: err.message } };
    if (err.details) body.error.details = err.details;
    return res.status(err.statusCode).json(body);
  }

  console.error(err);
  res.status(500).json({
    error: { message: 'Something went wrong' },
  });
}