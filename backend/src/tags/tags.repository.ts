import { pool } from '../db';
import { Tag } from './tags.entity';

export class TagsRepository {
  async findAll(): Promise<Tag[]> {
    const result = await pool.query(`
      SELECT id, name, created_at
      FROM tags
      ORDER BY name;
    `);

    return result.rows.map((row) => new Tag(
      row.id,
      row.name,
      row.created_at,
    ));
  }
}
