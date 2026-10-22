import assert from 'node:assert/strict';
import test from 'node:test';
import express from 'express';
import request from 'supertest';
import { User } from '../users/users.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { createRequireAuth } from './requireAuth';

const JWT_SECRET = 'authentication-flow-test-secret';
const PASSWORD = 'stitchlog123';
const PASSWORD_HASH = '$2b$12$fAU8yq8CdsHNizj63CeJUO.acoR3o6XZ5TMA9eIrBYw25LqxSydom';

function createUser(): User {
  return new User(
    1,
    'Taisa',
    'taisa@example.com',
    PASSWORD_HASH,
    false,
    new Date('2026-01-01T00:00:00.000Z'),
  );
}

function createTestApp() {
  const user = createUser();
  const service = new AuthService(
    {
      findByEmail: async (email) => email === user.getEmail() ? user : null,
    },
    { jwtSecret: JWT_SECRET, jwtExpiresIn: '1h' },
  );
  const controller = new AuthController(service);
  const app = express();

  app.use(express.json());
  app.post('/api/login', controller.login);
  app.get('/api/private', createRequireAuth(JWT_SECRET), (req, res) => {
    res.json({ userId: req.auth?.userId });
  });

  return app;
}

test('valid login returns a JWT that grants access to a private route', async () => {
  const app = createTestApp();
  const loginResponse = await request(app)
    .post('/api/login')
    .send({ email: 'taisa@example.com', password: PASSWORD })
    .expect(200);

  const privateResponse = await request(app)
    .get('/api/private')
    .set('Authorization', `Bearer ${loginResponse.body.token}`)
    .expect(200);

  assert.deepEqual(privateResponse.body, { userId: 1 });
});
