import { pool } from '../db';
import { User } from './users.entity';

interface UserRow {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  password_reset_required: boolean;
  created_at: Date;
}

export interface CreateUserData {
  name: string;
  email: string;
  passwordHash: string;
}

export interface UpdateUserData {
  name: string;
  email: string;
  passwordHash?: string;
}

export class UsersRepository {
  async findAll(): Promise<User[]> {
    const result = await pool.query<UserRow>(`
      SELECT id, name, email, password_hash, password_reset_required, created_at
      FROM users
      ORDER BY created_at DESC;
    `);

    return result.rows.map((row) => this.toEntity(row));
  }

  async findById(id: number): Promise<User | null> {
    const result = await pool.query<UserRow>(`
      SELECT id, name, email, password_hash, password_reset_required, created_at
      FROM users
      WHERE id = $1
      LIMIT 1;
    `, [id]);

    const row = result.rows[0];
    return row ? this.toEntity(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query<UserRow>(`
      SELECT id, name, email, password_hash, password_reset_required, created_at
      FROM users
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1;
    `, [email]);

    const row = result.rows[0];
    return row ? this.toEntity(row) : null;
  }

  async create(data: CreateUserData): Promise<User> {
    const result = await pool.query<UserRow>(`
      INSERT INTO users (name, email, password_hash, password_reset_required)
      VALUES ($1, $2, $3, FALSE)
      RETURNING id, name, email, password_hash, password_reset_required, created_at;
    `, [data.name, data.email, data.passwordHash]);

    return this.toEntity(result.rows[0]);
  }

  async update(id: number, data: UpdateUserData): Promise<User | null> {
    const passwordHash = data.passwordHash ?? null;
    const result = await pool.query<UserRow>(`
      UPDATE users
      SET name = $2,
          email = $3,
          password_hash = COALESCE($4, password_hash),
          password_reset_required = CASE
            WHEN $4 IS NULL THEN password_reset_required
            ELSE FALSE
          END
      WHERE id = $1
      RETURNING id, name, email, password_hash, password_reset_required, created_at;
    `, [id, data.name, data.email, passwordHash]);

    const row = result.rows[0];
    return row ? this.toEntity(row) : null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM users WHERE id = $1;', [id]);
    return result.rowCount === 1;
  }

  private toEntity(row: UserRow): User {
    return new User(
      row.id,
      row.name,
      row.email,
      row.password_hash,
      row.password_reset_required,
      row.created_at,
    );
  }
}
