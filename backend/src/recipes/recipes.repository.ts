import { pool } from '../db';
import { Recipe } from './recipes.entity';

interface RecipeRow {
  id: number;
  title: string;
  description: string | null;
  difficulty: string;
  category: string;
  creator_name: string;
  created_at: Date;
}

export interface RecipeWriteData {
  title: string;
  description: string | null;
  difficulty: string;
  categoryId: number;
}

export interface CreateRecipeData extends RecipeWriteData {
  userId: number;
}

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
    const result = await pool.query<RecipeRow>(query);
    return result.rows.map((row) => this.toEntity(row));
  }

  async findById(id: number): Promise<Recipe | null> {
    const query = `
      SELECT r.id, r.title, r.description, r.difficulty,
             c.name AS category, u.name AS creator_name, r.created_at
      FROM recipes r
      JOIN users u ON r.user_id = u.id
      JOIN categories c ON r.category_id = c.id
      WHERE r.id = $1
      LIMIT 1;
    `;
    const result = await pool.query<RecipeRow>(query, [id]);
    const row = result.rows[0];
    return row ? this.toEntity(row) : null;
  }

  async findOwnerIdById(id: number): Promise<number | null> {
    const result = await pool.query<{ user_id: number }>(`
      SELECT user_id
      FROM recipes
      WHERE id = $1
      LIMIT 1;
    `, [id]);

    return result.rows[0]?.user_id ?? null;
  }

  async create(data: CreateRecipeData): Promise<Recipe> {
    const result = await pool.query<RecipeRow>(`
      WITH inserted AS (
        INSERT INTO recipes (title, description, difficulty, category_id, user_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, title, description, difficulty, category_id, user_id, created_at
      )
      SELECT i.id, i.title, i.description, i.difficulty,
             c.name AS category, u.name AS creator_name, i.created_at
      FROM inserted i
      JOIN categories c ON c.id = i.category_id
      JOIN users u ON u.id = i.user_id;
    `, [
      data.title,
      data.description,
      data.difficulty,
      data.categoryId,
      data.userId,
    ]);

    return this.toEntity(result.rows[0]);
  }

  async update(id: number, userId: number, data: RecipeWriteData): Promise<Recipe | null> {
    const result = await pool.query<RecipeRow>(`
      WITH updated AS (
        UPDATE recipes
        SET title = $3,
            description = $4,
            difficulty = $5,
            category_id = $6
        WHERE id = $1 AND user_id = $2
        RETURNING id, title, description, difficulty, category_id, user_id, created_at
      )
      SELECT u.id, u.title, u.description, u.difficulty,
             c.name AS category, creator.name AS creator_name, u.created_at
      FROM updated u
      JOIN categories c ON c.id = u.category_id
      JOIN users creator ON creator.id = u.user_id;
    `, [
      id,
      userId,
      data.title,
      data.description,
      data.difficulty,
      data.categoryId,
    ]);

    const row = result.rows[0];
    return row ? this.toEntity(row) : null;
  }

  async delete(id: number, userId: number): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM recipes WHERE id = $1 AND user_id = $2;',
      [id, userId],
    );
    return result.rowCount === 1;
  }

  private toEntity(row: RecipeRow): Recipe {
    return new Recipe(
      row.id,
      row.title,
      row.description,
      row.difficulty,
      row.category,
      row.creator_name,
      row.created_at,
    );
  }
}
