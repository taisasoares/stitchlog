import { pool } from '../db';
import { Recipe } from './recipes.entity';

export class RecipesRepository {
  async findAll(): Promise<Recipe[]> {
    const query = `
      SELECT r.id, r.title, r.description, r.difficulty,
             c.name AS category, u.name AS creator_name, r.created_at
      FROM recipes r
      JOIN users u ON r.user_id = u.id
      JOIN categories c ON r.category_id = c.id
      ORDER BY r.created_at DESC;
    `;
    const result = await pool.query(query);
    return result.rows.map((row) => new Recipe(
      row.id,
      row.title,
      row.description,
      row.difficulty,
      row.category,
      row.creator_name,
      row.created_at,
    ));
  }
}
