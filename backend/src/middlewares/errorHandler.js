import { Prisma } from '@prisma/client';
import { AppError } from '../utils/AppError.js';

function sendError(res, statusCode, message) {
  return res.status(statusCode).json({ error: { message } });
}

export function errorHandler(err, _req, res, _next) {
  if (err instanceof AppError) {
    return sendError(res, err.statusCode, err.message);
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const field = err.meta?.target?.[0] ?? 'value';
      return sendError(res, 409, `This ${field} is already in use`);
    }
    if (err.code === 'P2025') {
      return sendError(res, 404, 'Agent not found');
    }
  }

  if (err.type === 'entity.parse.failed') {
    return sendError(res, 400, 'Request body must be valid JSON');
  }

  console.error(err);
  return sendError(res, 500, 'Something went wrong');
}