import { Request, Response, NextFunction } from 'express';
import { AppError } from './AppError';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error('Erro capturado pelo servidor:', err);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message
      }
    });
    return;
  }

  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Ocorreu um erro interno inesperado no servidor.'
    }
  });
}
