import { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/AppError';
import { CreateUserInput, UpdateUserInput } from './users.service';
import { UsersService } from './users.service';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class UsersController {
  private service = new UsersService();

  getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await this.service.listAllUsers();
      res.json(users);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.service.getUserById(this.parseId(req.params.id));
      res.json(user);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.service.createUser(this.validateCreateInput(req.body));
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.service.updateUser(
        this.parseId(req.params.id),
        this.getAuthenticatedUserId(req),
        this.validateUpdateInput(req.body),
      );
      res.json(user);
    } catch (error) {
      next(error);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.deleteUser(
        this.parseId(req.params.id),
        this.getAuthenticatedUserId(req),
      );
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  private parseId(value: unknown): number {
    if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) {
      throw new AppError('ID de usuário inválido.', 400, 'INVALID_USER_ID');
    }

    const id = Number(value);
    if (!Number.isSafeInteger(id)) {
      throw new AppError('ID de usuário inválido.', 400, 'INVALID_USER_ID');
    }
    return id;
  }

  private validateCreateInput(body: unknown): CreateUserInput {
    const input = this.readCommonInput(body);
    const password = this.readPassword(input.password, true);
    return { name: input.name, email: input.email, password };
  }

  private validateUpdateInput(body: unknown): UpdateUserInput {
    const input = this.readCommonInput(body);
    const password = this.readPassword(input.password, false);
    return password === undefined
      ? { name: input.name, email: input.email }
      : { name: input.name, email: input.email, password };
  }

  private readCommonInput(body: unknown): { name: string; email: string; password: unknown } {
    if (!body || typeof body !== 'object') {
      throw this.invalidUserDataError();
    }

    const { name, email, password } = body as Record<string, unknown>;
    if (
      typeof name !== 'string'
      || name.trim().length === 0
      || name.trim().length > 100
      || typeof email !== 'string'
      || email.trim().length > 200
      || !EMAIL_PATTERN.test(email.trim())
    ) {
      throw this.invalidUserDataError();
    }

    return { name: name.trim(), email: email.trim(), password };
  }

  private readPassword(value: unknown, required: true): string;
  private readPassword(value: unknown, required: false): string | undefined;
  private readPassword(value: unknown, required: boolean): string | undefined {
    if (value === undefined && !required) return undefined;
    if (
      typeof value !== 'string'
      || value.length < 8
      || Buffer.byteLength(value, 'utf8') > 72
    ) {
      throw new AppError(
        'A senha deve ter entre 8 e 72 bytes.',
        400,
        'INVALID_PASSWORD',
      );
    }
    return value;
  }

  private getAuthenticatedUserId(req: Request): number {
    if (!req.auth) {
      throw new AppError('Autenticação obrigatória.', 401, 'AUTH_TOKEN_REQUIRED');
    }
    return req.auth.userId;
  }

  private invalidUserDataError(): AppError {
    return new AppError('Nome e e-mail válidos são obrigatórios.', 400, 'INVALID_USER_DATA');
  }
}
