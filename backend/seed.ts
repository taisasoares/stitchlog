import 'dotenv/config';
import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('A variável DATABASE_URL não foi definida.');
}

async function run(): Promise<void> {
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    const sql = fs.readFileSync(path.join(process.cwd(), 'seed.sql'), 'utf-8');
    await client.query(sql);
    console.log('Seed concluída com sucesso.');
  } finally {
    await client.end();
  }
}

run().catch((error) => {
  console.error('Erro ao executar a seed:', error);
  process.exit(1);
});
