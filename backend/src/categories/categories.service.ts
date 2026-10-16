import { Category } from './categories.entity';
import { CategoriesRepository } from './categories.repository';

export class CategoriesService {
  private repository = new CategoriesRepository();

  async listAllCategories(): Promise<Category[]> {
    return this.repository.findAll();
  }
}
