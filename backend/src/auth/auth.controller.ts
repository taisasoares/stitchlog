import { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/AppError';
import { AuthService } from './auth.service';

type Authenticator = Pick<AuthService, 'login'>;

export class AuthController {
  constructor(private readonly service: Authenticator = new AuthService()) {}

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body ?? {};

      if (
        typeof email !== 'string'
        || email.trim().length === 0
        || typeof password !== 'string'
        || password.length === 0
      ) {
        throw new AppError(
          'E-mail e senha são obrigatórios.',
          400,
          'INVALID_LOGIN_DATA',
        );
      }

      const result = await this.service.login(email, password);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
