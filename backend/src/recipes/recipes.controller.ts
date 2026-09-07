import { Request, Response, NextFunction } from 'express';
import { RecipesService } from './recipes.service';

export class RecipesController {
  private service = new RecipesService();

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const recipes = await this.service.listAllRecipes();
      res.json(recipes);
    } catch (err) {
      next(err);
    }
  };
}