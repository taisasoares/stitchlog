import { NextFunction, Request, Response } from 'express';
import { UsersService } from './users.service';

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
}
