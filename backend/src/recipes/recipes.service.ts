import { RecipesRepository, Recipe } from './recipes.repository';

export class RecipesService {
  private repository = new RecipesRepository();

  async listAllRecipes(): Promise<Recipe[]> {
    return this.repository.findAll();
  }
}