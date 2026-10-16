import { NextFunction, Request, Response } from 'express';
import { StepsService } from './steps.service';

export class StepsController {
  private service = new StepsService();

  getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const steps = await this.service.listAllSteps();
      res.json(steps);
    } catch (error) {
      next(error);
    }
  };
}
