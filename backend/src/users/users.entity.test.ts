import assert from 'node:assert/strict';
import test from 'node:test';
import { User } from './users.entity';

test('User exposes authentication data internally but omits it from JSON', () => {
  const createdAt = new Date('2026-01-01T00:00:00.000Z');
  const passwordHash = '$2b$12$u5HE.tUQ5gUhB9KpFntBZuMxmVl.v.kfFPTFO2F.ssyqjtJXJjUn6';
  const user = new User(1, 'Taisa', 'taisa@example.com', passwordHash, true, createdAt);

  assert.equal(user.getPasswordHash(), passwordHash);
  assert.equal(user.isPasswordResetRequired(), true);
  assert.deepEqual(JSON.parse(JSON.stringify(user)), {
    id: 1,
    name: 'Taisa',
    email: 'taisa@example.com',
    created_at: createdAt.toISOString(),
  });
});
