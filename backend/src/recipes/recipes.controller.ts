import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { RecipeInput, RecipesService } from './recipes.service';

type RecipesUseCases = Pick<
  RecipesService,
  'listAllRecipes' | 'getRecipeById' | 'createRecipe' | 'updateRecipe' | 'deleteRecipe'
>;
const POSTGRES_INTEGER_MAX = 2_147_483_647;

export class RecipesController {
  constructor(private readonly service: RecipesUseCases = new RecipesService()) {}

  getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const recipes = await this.service.listAllRecipes();
      res.json(recipes);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const recipe = await this.service.getRecipeById(this.parseId(req.params.id));
      res.status(200).json(recipe);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const recipe = await this.service.createRecipe(
        this.getAuthenticatedUserId(req),
        this.validateRecipeInput(req.body),
      );
      res.status(201).json(recipe);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const recipe = await this.service.updateRecipe(
        this.parseId(req.params.id),
        this.getAuthenticatedUserId(req),
        this.validateRecipeInput(req.body),
      );
      res.status(200).json(recipe);
    } catch (error) {
      next(error);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.deleteRecipe(
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
      throw this.invalidRecipeIdError();
    }

    const id = Number(value);
    if (!Number.isSafeInteger(id) || id > POSTGRES_INTEGER_MAX) {
      throw this.invalidRecipeIdError();
    }
    return id;
  }

  private invalidRecipeIdError(): AppError {
    return new AppError('ID de receita inválido.', 400, 'INVALID_RECIPE_ID');
  }

  private validateRecipeInput(body: unknown): RecipeInput {
    if (!body || typeof body !== 'object') throw this.invalidRecipeDataError();

    const { title, description, difficulty, categoryId } = body as Record<string, unknown>;
    if (
      typeof title !== 'string'
      || title.trim().length === 0
      || title.trim().length > 200
      || (description !== undefined && description !== null && typeof description !== 'string')
      || typeof difficulty !== 'string'
      || difficulty.trim().length === 0
      || difficulty.trim().length > 50
      || typeof categoryId !== 'number'
      || !Number.isInteger(categoryId)
      || categoryId <= 0
      || categoryId > POSTGRES_INTEGER_MAX
    ) {
      throw this.invalidRecipeDataError();
    }

    return {
      title: title.trim(),
      description: typeof description === 'string' ? description.trim() : null,
      difficulty: difficulty.trim(),
      categoryId,
    };
  }

  private getAuthenticatedUserId(req: Request): number {
    if (!req.auth) {
      throw new AppError('Autenticação obrigatória.', 401, 'AUTH_TOKEN_REQUIRED');
    }
    return req.auth.userId;
  }

  private invalidRecipeDataError(): AppError {
    return new AppError(
      'Título, dificuldade e categoria válidos são obrigatórios.',
      400,
      'INVALID_RECIPE_DATA',
    );
  }
}
