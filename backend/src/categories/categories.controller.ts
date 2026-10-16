import { NextFunction, Request, Response } from 'express';
import { CategoriesService } from './categories.service';

export class CategoriesController {
  private service = new CategoriesService();

  getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categories = await this.service.listAllCategories();
      res.json(categories);
    } catch (error) {
      next(error);
    }
  };
}
