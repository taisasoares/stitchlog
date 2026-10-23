import { AppError } from '../errors/AppError';
import { CategoriesRepository } from '../categories/categories.repository';
import { Recipe } from './recipes.entity';
import { RecipesRepository, RecipeWriteData } from './recipes.repository';

export interface RecipeInput {
  title: string;
  description: string | null;
  difficulty: string;
  categoryId: number;
}

type RecipesDataSource = Pick<
  RecipesRepository,
  'findAll' | 'findById' | 'findOwnerIdById' | 'create' | 'update' | 'delete'
>;
type CategoriesDataSource = Pick<CategoriesRepository, 'findById'>;

interface DatabaseError {
  code?: string;
  constraint?: string;
}

export class RecipesService {
  constructor(
    private readonly repository: RecipesDataSource = new RecipesRepository(),
    private readonly categoriesRepository: CategoriesDataSource = new CategoriesRepository(),
  ) {}

  async listAllRecipes(): Promise<Recipe[]> {
    return this.repository.findAll();
  }

  async getRecipeById(id: number): Promise<Recipe> {
    const recipe = await this.repository.findById(id);
    if (!recipe) throw this.recipeNotFoundError();
    return recipe;
  }

  async createRecipe(userId: number, input: RecipeInput): Promise<Recipe> {
    await this.ensureCategoryExists(input.categoryId);

    try {
      return await this.repository.create({
        ...this.normalizeInput(input),
        userId,
      });
    } catch (error) {
      this.rethrowWriteError(error);
    }
  }

  async updateRecipe(
    id: number,
    authenticatedUserId: number,
    input: RecipeInput,
  ): Promise<Recipe> {
    await this.ensureRecipeOwner(id, authenticatedUserId);

    await this.ensureCategoryExists(input.categoryId);

    try {
      const recipe = await this.repository.update(
        id,
        authenticatedUserId,
        this.normalizeInput(input),
      );
      if (!recipe) throw this.recipeNotFoundError();
      return recipe;
    } catch (error) {
      if (error instanceof AppError) throw error;
      this.rethrowWriteError(error);
    }
  }

  async deleteRecipe(id: number, authenticatedUserId: number): Promise<void> {
    await this.ensureRecipeOwner(id, authenticatedUserId);
    const deleted = await this.repository.delete(id, authenticatedUserId);
    if (!deleted) throw this.recipeNotFoundError();
  }

  private normalizeInput(input: RecipeInput): RecipeWriteData {
    return {
      title: input.title.trim(),
      description: input.description?.trim() || null,
      difficulty: input.difficulty.trim(),
      categoryId: input.categoryId,
    };
  }

  private async ensureCategoryExists(categoryId: number): Promise<void> {
    const category = await this.categoriesRepository.findById(categoryId);
    if (!category) throw this.categoryNotFoundError();
  }

  private async ensureRecipeOwner(id: number, authenticatedUserId: number): Promise<void> {
    const ownerId = await this.repository.findOwnerIdById(id);
    if (ownerId === null) throw this.recipeNotFoundError();
    if (ownerId !== authenticatedUserId) {
      throw new AppError(
        'Você não tem autorização para modificar esta receita.',
        403,
        'FORBIDDEN',
      );
    }
  }

  private rethrowWriteError(error: unknown): never {
    const databaseError = error as DatabaseError;
    if (databaseError?.code === '23503') {
      if (databaseError.constraint === 'recipes_category_id_fkey') {
        throw this.categoryNotFoundError();
      }
      if (databaseError.constraint === 'recipes_user_id_fkey') {
        throw new AppError(
          'Token de autenticação inválido.',
          401,
          'INVALID_TOKEN',
        );
      }
    }
    throw error;
  }

  private recipeNotFoundError(): AppError {
    return new AppError('Receita não encontrada.', 404, 'RECIPE_NOT_FOUND');
  }

  private categoryNotFoundError(): AppError {
    return new AppError('Categoria não encontrada.', 404, 'CATEGORY_NOT_FOUND');
  }
}
