import assert from 'node:assert/strict';
import test from 'node:test';
import { loadConfig } from './config';

test('JWT_SECRET is required', () => {
  const previousDatabaseUrl = process.env.DATABASE_URL;
  const previousJwtSecret = process.env.JWT_SECRET;

  process.env.DATABASE_URL = 'postgresql://localhost/stitchlog_test';
  delete process.env.JWT_SECRET;

  try {
    assert.throws(() => loadConfig(), /JWT_SECRET/);
  } finally {
    if (previousDatabaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = previousDatabaseUrl;

    if (previousJwtSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previousJwtSecret;
  }
});
