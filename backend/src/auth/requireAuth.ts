import { NextFunction, Request, RequestHandler, Response } from 'express';
import jwt, { TokenExpiredError } from 'jsonwebtoken';
import { loadConfig } from '../config';
import { AppError } from '../errors/AppError';

function authenticationError(code: string, message: string): AppError {
  return new AppError(message, 401, code);
}

export function createRequireAuth(jwtSecret: string): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const authorization = req.get('authorization');
    const match = authorization?.match(/^Bearer\s+(\S+)$/i);

    if (!match) {
      next(authenticationError(
        'AUTH_TOKEN_REQUIRED',
        'Token de autenticação não informado.',
      ));
      return;
    }

    try {
      const payload = jwt.verify(match[1], jwtSecret, {
        algorithms: ['HS256'],
      });

      if (
        typeof payload === 'string'
        || typeof payload.sub !== 'string'
        || !/^[1-9]\d*$/.test(payload.sub)
      ) {
        next(authenticationError('INVALID_TOKEN', 'Token de autenticação inválido.'));
        return;
      }

      const userId = Number(payload.sub);
      if (!Number.isSafeInteger(userId) || userId <= 0) {
        next(authenticationError('INVALID_TOKEN', 'Token de autenticação inválido.'));
        return;
      }

      req.auth = { userId };
      next();
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        next(authenticationError('TOKEN_EXPIRED', 'Token de autenticação expirado.'));
        return;
      }

      next(authenticationError('INVALID_TOKEN', 'Token de autenticação inválido.'));
    }
  };
}

let configuredMiddleware: RequestHandler | undefined;

export const requireAuth: RequestHandler = (req, res, next) => {
  configuredMiddleware ??= createRequireAuth(loadConfig().jwtSecret);
  configuredMiddleware(req, res, next);
};
