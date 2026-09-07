import { pool } from '../db';

export interface Recipe {
  id: number;
  title: string;
  description: string | null;
  difficulty: string;
  category: string;
  creator_name: string;
  created_at: Date;
}

export class RecipesRepository {
  async findAll(): Promise<Recipe[]> {
    const query = `
      SELECT r.id, r.title, r.description, r.difficulty, r.category, r.created_at, u.name as creator_name
      FROM recipes r
      JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC;
    `;
    const result = await pool.query(query);
    return result.rows;
  }
}