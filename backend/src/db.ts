import { Pool } from 'pg';
import { loadDatabaseUrl } from './config';

export const pool = new Pool({
  connectionString: loadDatabaseUrl(),
});
