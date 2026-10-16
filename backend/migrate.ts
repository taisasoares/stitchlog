import 'dotenv/config';
import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("Erro: A variável DATABASE_URL não foi definida.");
  process.exit(1);
}

async function run() {
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  const migrationsDir = path.join(process.cwd(), 'migrations');
  const files = fs.readdirSync(migrationsDir).sort();

  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const appliedResult = await client.query<{ filename: string }>(
    'SELECT filename FROM schema_migrations'
  );
  const applied = new Set(appliedResult.rows.map((row) => row.filename));

  // Compatibilidade com bancos criados antes da tabela de controle de migrations.
  if (applied.size === 0) {
    const legacyResult = await client.query<{
      recipes_exists: boolean;
      users_exists: boolean;
      user_id_exists: boolean;
    }>(`
      SELECT
        to_regclass('recipes') IS NOT NULL AS recipes_exists,
        to_regclass('users') IS NOT NULL AS users_exists,
        EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = current_schema()
            AND table_name = 'recipes'
            AND column_name = 'user_id'
        ) AS user_id_exists
    `);
    const legacy = legacyResult.rows[0];

    if (legacy.recipes_exists) {
      await client.query(
        'INSERT INTO schema_migrations (filename) VALUES ($1) ON CONFLICT DO NOTHING',
        ['001_create_recipes.sql']
      );
      applied.add('001_create_recipes.sql');
    }

    if (legacy.users_exists && legacy.user_id_exists) {
      await client.query(
        'INSERT INTO schema_migrations (filename) VALUES ($1) ON CONFLICT DO NOTHING',
        ['002_create_users_add_fk.sql']
      );
      applied.add('002_create_users_add_fk.sql');
    }
  }

  for (const file of files) {
    if (!file.endsWith('.sql') || applied.has(file)) {
      continue;
    }

    console.log(`Executando: ${file}`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');

    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query(
        'INSERT INTO schema_migrations (filename) VALUES ($1)',
        [file]
      );
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  }

  await client.end();
  console.log("Migrations concluídas com sucesso.");
}

run().catch((err) => {
  console.error("Erro ao aplicar as migrations:", err);
  process.exit(1);
});
