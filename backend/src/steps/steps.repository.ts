import { pool } from '../db';
import { Step } from './steps.entity';

export class StepsRepository {
  async findAll(): Promise<Step[]> {
    const result = await pool.query(`
      SELECT s.id, s.recipe_id, r.title AS recipe_title,
             s.position, s.instruction, s.stitch_types, s.created_at
      FROM steps s
      JOIN recipes r ON r.id = s.recipe_id
      ORDER BY s.recipe_id, s.position;
    `);

    return result.rows.map((row) => new Step(
      row.id,
      row.recipe_id,
      row.recipe_title,
      row.position,
      row.instruction,
      row.stitch_types,
      row.created_at,
    ));
  }
}
