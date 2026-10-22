import 'dotenv/config';
import type { SignOptions } from 'jsonwebtoken';

export interface Config {
  databaseUrl: string;
  port: number;
  jwtSecret: string;
  jwtExpiresIn: NonNullable<SignOptions['expiresIn']>;
}

export function loadDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("Variável de ambiente DATABASE_URL é obrigatória!!");
  }

  return databaseUrl;
}

export function loadConfig(): Config {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('Variável de ambiente JWT_SECRET é obrigatória!!');
  }

  return {
    databaseUrl: loadDatabaseUrl(),
    port: parseInt(process.env.PORT || '3000', 10),
    jwtSecret,
    jwtExpiresIn: (process.env.JWT_EXPIRES_IN || '1h') as NonNullable<SignOptions['expiresIn']>,
  };
}
