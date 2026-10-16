import { NextFunction, Request, Response } from 'express';
import { ExecutionsService } from './executions.service';

export class ExecutionsController {
  private service = new ExecutionsService();

  getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const executions = await this.service.listAllExecutions();
      res.json(executions);
    } catch (error) {
      next(error);
    }
  };
}
