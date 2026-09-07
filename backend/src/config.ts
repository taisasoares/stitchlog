import 'dotenv/config';

export interface Config {
  databaseUrl: string;
  port: number;
}

export function loadConfig(): Config {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("Variável de ambiente DATABASE_URL é obrigatória!!");
  }

  return {
    databaseUrl,
    port: parseInt(process.env.PORT || '3000', 10),
  };
}