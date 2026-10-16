import { pool } from '../db';
import { Material, MaterialKind } from './materials.entity';

export class MaterialsRepository {
  async findAll(): Promise<Material[]> {
    const result = await pool.query(`
      SELECT id, name, kind, created_at
      FROM materials
      ORDER BY kind, name;
    `);

    return result.rows.map((row) => new Material(
      row.id,
      row.name,
      row.kind as MaterialKind,
      row.created_at,
    ));
  }
}
