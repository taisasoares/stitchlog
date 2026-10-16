import { pool } from '../db';
import { User } from './users.entity';

export class UsersRepository {
  async findAll(): Promise<User[]> {
    const result = await pool.query(`
      SELECT id, name, email, created_at
      FROM users
      ORDER BY created_at DESC;
    `);

    return result.rows.map((row) => new User(
      row.id,
      row.name,
      row.email,
      row.created_at,
    ));
  }
}
