import assert from 'node:assert/strict';
import test from 'node:test';
import jwt from 'jsonwebtoken';
import { AppError } from '../errors/AppError';
import { User } from '../users/users.entity';
import { AuthService } from './auth.service';

const JWT_SECRET = 'test-secret-with-enough-entropy';
const PASSWORD = 'stitchlog123';
const PASSWORD_HASH = '$2b$12$fAU8yq8CdsHNizj63CeJUO.acoR3o6XZ5TMA9eIrBYw25LqxSydom';

function createUser(passwordResetRequired = false): User {
  return new User(
    1,
    'Taisa',
    'taisa@example.com',
    PASSWORD_HASH,
    passwordResetRequired,
    new Date('2026-01-01T00:00:00.000Z'),
  );
}

function createService(user: User | null): AuthService {
  return new AuthService(
    { findByEmail: async () => user },
    { jwtSecret: JWT_SECRET, jwtExpiresIn: '1h' },
  );
}

test('login returns a JWT and public user data for valid credentials', async () => {
  const result = await createService(createUser()).login(' TAISA@EXAMPLE.COM ', PASSWORD);
  const payload = jwt.verify(result.token, JWT_SECRET);

  assert.ok(typeof payload !== 'string');
  assert.equal(payload.sub, '1');
  assert.equal(result.user.id, 1);
});

test('login rejects invalid credentials and users requiring password reset', async () => {
  const isInvalidCredentials = (error: unknown) => error instanceof AppError
    && error.code === 'INVALID_CREDENTIALS';

  await assert.rejects(
    createService(createUser()).login('taisa@example.com', 'incorrect'),
    isInvalidCredentials,
  );
  await assert.rejects(
    createService(createUser(true)).login('taisa@example.com', PASSWORD),
    isInvalidCredentials,
  );
});
