import { pool } from '../db';
import { Category } from './categories.entity';

interface CategoryRow {
  id: number;
  name: string;
  created_at: Date;
}

export class CategoriesRepository {
  async findAll(): Promise<Category[]> {
    const result = await pool.query<CategoryRow>(`
      SELECT id, name, created_at
      FROM categories
      ORDER BY name;
    `);

    return result.rows.map((row) => this.toEntity(row));
  }

  async findById(id: number): Promise<Category | null> {
    const result = await pool.query<CategoryRow>(`
      SELECT id, name, created_at
      FROM categories
      WHERE id = $1
      LIMIT 1;
    `, [id]);

    const row = result.rows[0];
    return row ? this.toEntity(row) : null;
  }

  private toEntity(row: CategoryRow): Category {
    return new Category(
      row.id,
      row.name,
      row.created_at,
    );
  }
}
