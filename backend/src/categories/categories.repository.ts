import { pool } from '../db';
import { Category } from './categories.entity';

export class CategoriesRepository {
  async findAll(): Promise<Category[]> {
    const result = await pool.query(`
      SELECT id, name, created_at
      FROM categories
      ORDER BY name;
    `);

    return result.rows.map((row) => new Category(
      row.id,
      row.name,
      row.created_at,
    ));
  }
}
