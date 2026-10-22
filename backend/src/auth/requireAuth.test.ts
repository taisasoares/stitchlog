import assert from 'node:assert/strict';
import test from 'node:test';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../errors/AppError';
import { createRequireAuth } from './requireAuth';

const JWT_SECRET = 'middleware-test-secret';

interface MiddlewareResult {
  request: Request;
  nextCalled: boolean;
  error?: unknown;
}

function executeMiddleware(authorization?: string): MiddlewareResult {
  const request = {
    get: (name: string) => name.toLowerCase() === 'authorization' ? authorization : undefined,
  } as Request;
  let nextCalled = false;
  let nextError: unknown;
  const next = ((error?: unknown) => {
    nextCalled = true;
    nextError = error;
  }) as NextFunction;

  createRequireAuth(JWT_SECRET)(request, {} as Response, next);
  return { request, nextCalled, error: nextError };
}

function assertAuthenticationError(result: MiddlewareResult, code: string): void {
  assert.ok(result.error instanceof AppError);
  assert.equal(result.error.code, code);
}

test('requires a Bearer token', () => {
  assertAuthenticationError(executeMiddleware(), 'AUTH_TOKEN_REQUIRED');
});

test('rejects invalid and expired tokens', () => {
  assertAuthenticationError(executeMiddleware('Bearer invalid-token'), 'INVALID_TOKEN');

  const expiredToken = jwt.sign({}, JWT_SECRET, {
    algorithm: 'HS256',
    subject: '1',
    expiresIn: -1,
  });
  assertAuthenticationError(executeMiddleware(`Bearer ${expiredToken}`), 'TOKEN_EXPIRED');
});

test('allows valid tokens and exposes the authenticated identity', () => {
  const token = jwt.sign({}, JWT_SECRET, {
    algorithm: 'HS256',
    subject: '42',
    expiresIn: '1h',
  });
  const result = executeMiddleware(`Bearer ${token}`);

  assert.equal(result.nextCalled, true);
  assert.equal(result.error, undefined);
  assert.deepEqual(result.request.auth, { userId: 42 });
});
