import { pool } from '../db';
import { Execution, ExecutionStatus } from './executions.entity';

export class ExecutionsRepository {
  async findAll(): Promise<Execution[]> {
    const result = await pool.query(`
      SELECT e.id, e.user_id, u.name AS user_name,
             e.recipe_id, r.title AS recipe_title,
             e.status, e.progress, e.current_step_id,
             e.started_at, e.updated_at, e.completed_at
      FROM executions e
      JOIN users u ON u.id = e.user_id
      JOIN recipes r ON r.id = e.recipe_id
      ORDER BY e.updated_at DESC;
    `);

    return result.rows.map((row) => new Execution(
      row.id,
      row.user_id,
      row.user_name,
      row.recipe_id,
      row.recipe_title,
      row.status as ExecutionStatus,
      row.progress,
      row.current_step_id,
      row.started_at,
      row.updated_at,
      row.completed_at,
    ));
  }
}
