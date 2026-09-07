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

  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir).sort();

  for (const file of files) {
    if (file.endsWith('.sql')) {
      console.log(`Executando: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
      await client.query(sql);
    }
  }

  await client.end();
  console.log("Migrations concluídas com sucesso.");
}

run().catch((err) => {
  console.error("Erro ao aplicar as migrations:", err);
  process.exit(1);
});