import assert from 'node:assert/strict';
import test from 'node:test';
import { AppError } from '../errors/AppError';
import { User } from './users.entity';
import { CreateUserData, UpdateUserData } from './users.repository';
import { UsersService } from './users.service';

type RepositoryStub = ConstructorParameters<typeof UsersService>[0];

function makeUser(id: number, email = `user${id}@example.com`): User {
  return new User(id, `User ${id}`, email, 'stored-hash', false, new Date('2026-01-01'));
}

function stubRepository(overrides: Partial<RepositoryStub> = {}): RepositoryStub {
  return {
    findAll: async () => [],
    findById: async () => null,
    findByEmail: async () => null,
    create: async () => { throw new Error('Unexpected create'); },
    update: async () => { throw new Error('Unexpected update'); },
    delete: async () => false,
    ...overrides,
  };
}

function hasCode(code: string): (error: unknown) => boolean {
  return (error) => error instanceof AppError && error.code === code;
}

test('creates a user with normalized data', async () => {
  let createdData: CreateUserData | undefined;
  const repository = stubRepository({
    create: async (data) => {
      createdData = data;
      return makeUser(1, data.email);
    },
  });
  const service = new UsersService(repository, async () => 'new-hash');

  const result = await service.createUser({
    name: ' New User ',
    email: ' NEW@EXAMPLE.COM ',
    password: 'new-password',
  });

  assert.deepEqual(createdData, {
    name: 'New User',
    email: 'new@example.com',
    passwordHash: 'new-hash',
  });
  assert.equal(result.email, 'new@example.com');
});

test('rejects duplicate emails', async () => {
  const repository = stubRepository({
    findByEmail: async () => makeUser(1, 'taken@example.com'),
  });
  const service = new UsersService(repository);

  await assert.rejects(
    service.createUser({ name: 'Other', email: 'TAKEN@EXAMPLE.COM', password: 'password-123' }),
    hasCode('EMAIL_ALREADY_EXISTS'),
  );
});

test('returns 404 for a missing user', async () => {
  const service = new UsersService(stubRepository());

  await assert.rejects(service.getUserById(999), hasCode('USER_NOT_FOUND'));
});

test('forbids updating another user', async () => {
  const repository = stubRepository({ findById: async () => makeUser(2) });
  const service = new UsersService(repository);

  await assert.rejects(
    service.updateUser(2, 1, { name: 'Changed', email: 'user2@example.com' }),
    hasCode('FORBIDDEN'),
  );
});

test('updates the owner with a hashed password', async () => {
  let updatedData: UpdateUserData | undefined;
  const repository = stubRepository({
    findById: async () => makeUser(1),
    update: async (id, data) => {
      updatedData = data;
      return makeUser(id, data.email);
    },
  });
  const service = new UsersService(repository, async () => 'updated-hash');

  const result = await service.updateUser(1, 1, {
    name: ' Updated ',
    email: ' UPDATED@EXAMPLE.COM ',
    password: 'updated-password',
  });

  assert.deepEqual(updatedData, {
    name: 'Updated',
    email: 'updated@example.com',
    passwordHash: 'updated-hash',
  });
  assert.equal(result.email, 'updated@example.com');
});
