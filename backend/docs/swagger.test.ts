import assert from 'node:assert/strict';
import test from 'node:test';
import express from 'express';
import request from 'supertest';
import { setupSwagger, swaggerDocument } from './swagger';

interface OpenApiSchema {
  $ref?: string;
  type?: string;
  format?: string;
  required?: string[];
  properties?: Record<string, OpenApiSchema>;
  items?: OpenApiSchema;
}

interface OpenApiResponse {
  $ref?: string;
  content?: Record<string, {
    schema?: OpenApiSchema;
  }>;
}

interface OpenApiOperation {
  requestBody?: {
    content?: Record<string, {
      schema?: OpenApiSchema;
    }>;
  };
  responses?: Record<string, OpenApiResponse>;
  security?: Array<Record<string, unknown[]>>;
}

interface OpenApiDocument {
  openapi?: string;
  info?: {
    title?: string;
    version?: string;
  };
  servers?: Array<{
    url?: string;
  }>;
  paths?: Record<string, Record<string, OpenApiOperation>>;
  components?: {
    schemas?: Record<string, OpenApiSchema>;
    securitySchemes?: Record<string, Record<string, unknown>>;
  };
}

const document = swaggerDocument as OpenApiDocument;

function getOperation(path: string, method: string): OpenApiOperation {
  const operation = document.paths?.[path]?.[method];
  assert.ok(operation, `${method.toUpperCase()} ${path} must be documented`);
  return operation;
}

function getResponse(path: string, method: string, status: string): OpenApiResponse {
  const response = getOperation(path, method).responses?.[status];
  assert.ok(response, `${method.toUpperCase()} ${path} must document response ${status}`);
  return response;
}

test('Swagger document identifies StitchLog, its version and server', () => {
  assert.equal(document.openapi, '3.0.3');
  assert.equal(document.info?.title, 'StitchLog API');
  assert.equal(document.info?.version, '1.0.0');
  assert.match(document.servers?.[0]?.url || '', /^http:\/\/localhost:\d+$/);
});

test('OpenAPI documents the Recipe and login schemas', () => {
  const schemas = document.components?.schemas;

  assert.deepEqual(schemas?.Recipe?.required, [
    'id',
    'title',
    'description',
    'difficulty',
    'category',
    'creator_name',
    'created_at',
  ]);
  assert.equal(schemas?.Recipe?.properties?.created_at?.format, 'date-time');

  assert.deepEqual(schemas?.RecipeInput?.required, ['title', 'difficulty', 'categoryId']);
  assert.equal(schemas?.RecipeInput?.properties?.categoryId?.type, 'integer');

  assert.deepEqual(schemas?.LoginRequest?.required, ['email', 'password']);
  assert.equal(schemas?.LoginRequest?.properties?.email?.format, 'email');

  assert.deepEqual(schemas?.LoginResponse?.required, ['token', 'user']);
  assert.equal(
    schemas?.LoginResponse?.properties?.user?.$ref,
    '#/components/schemas/PublicUser',
  );
  assert.ok(schemas?.PublicUser);
  assert.ok(schemas?.ErrorResponse);
});

test('OpenAPI documents every Recipe operation and applicable response', () => {
  const operations = [
    ['/api/recipes', 'get', ['200', '500']],
    ['/api/recipes/{id}', 'get', ['200', '400', '404', '500']],
    ['/api/recipes', 'post', ['201', '400', '401', '404', '500']],
    ['/api/recipes/{id}', 'put', ['200', '400', '401', '403', '404', '500']],
    ['/api/recipes/{id}', 'delete', ['204', '400', '401', '403', '404', '500']],
  ] as const;

  for (const [path, method, statuses] of operations) {
    const operation = getOperation(path, method);
    for (const status of statuses) {
      assert.ok(
        operation.responses?.[status],
        `${method.toUpperCase()} ${path} must document response ${status}`,
      );
    }
  }
});

test('OpenAPI responses reference the expected schemas', () => {
  const recipeListSchema = getResponse('/api/recipes', 'get', '200')
    .content?.['application/json']?.schema;
  assert.equal(recipeListSchema?.type, 'array');
  assert.equal(recipeListSchema?.items?.$ref, '#/components/schemas/Recipe');

  for (const [path, method, status, schemaRef] of [
    ['/api/recipes/{id}', 'get', '200', '#/components/schemas/Recipe'],
    ['/api/recipes', 'post', '201', '#/components/schemas/Recipe'],
    ['/api/recipes/{id}', 'put', '200', '#/components/schemas/Recipe'],
    ['/api/login', 'post', '200', '#/components/schemas/LoginResponse'],
  ] as const) {
    assert.equal(
      getResponse(path, method, status).content?.['application/json']?.schema?.$ref,
      schemaRef,
    );
  }

  assert.equal(getResponse('/api/recipes/{id}', 'delete', '204').content, undefined);

  for (const [path, method, status] of [
    ['/api/recipes/{id}', 'get', '400'],
    ['/api/recipes/{id}', 'get', '404'],
    ['/api/recipes', 'post', '400'],
    ['/api/recipes', 'post', '401'],
    ['/api/recipes', 'post', '404'],
    ['/api/recipes/{id}', 'put', '400'],
    ['/api/recipes/{id}', 'put', '401'],
    ['/api/recipes/{id}', 'put', '403'],
    ['/api/recipes/{id}', 'put', '404'],
    ['/api/recipes/{id}', 'delete', '400'],
    ['/api/recipes/{id}', 'delete', '401'],
    ['/api/recipes/{id}', 'delete', '403'],
    ['/api/recipes/{id}', 'delete', '404'],
    ['/api/login', 'post', '400'],
    ['/api/login', 'post', '401'],
  ] as const) {
    assert.equal(
      getResponse(path, method, status).content?.['application/json']?.schema?.$ref,
      '#/components/schemas/ErrorResponse',
    );
  }

  for (const [path, method] of [
    ['/api/recipes', 'get'],
    ['/api/recipes/{id}', 'get'],
    ['/api/recipes', 'post'],
    ['/api/recipes/{id}', 'put'],
    ['/api/recipes/{id}', 'delete'],
    ['/api/login', 'post'],
  ] as const) {
    assert.equal(
      getResponse(path, method, '500').$ref,
      '#/components/responses/InternalServerError',
    );
  }
});

test('POST and PUT Recipe operations document their request bodies', () => {
  for (const [path, method] of [
    ['/api/recipes', 'post'],
    ['/api/recipes/{id}', 'put'],
  ] as const) {
    const schema = getOperation(path, method)
      .requestBody?.content?.['application/json']?.schema;

    assert.deepEqual(schema, { $ref: '#/components/schemas/RecipeInput' });
  }
});

test('OpenAPI documents login and its responses', () => {
  const login = getOperation('/api/login', 'post');

  assert.deepEqual(
    login.requestBody?.content?.['application/json']?.schema,
    { $ref: '#/components/schemas/LoginRequest' },
  );
  for (const status of ['200', '400', '401', '500']) {
    assert.ok(login.responses?.[status], `POST /api/login must document response ${status}`);
  }
});

test('OpenAPI configures bearerAuth only on private Recipe operations', () => {
  const bearerAuth = document.components?.securitySchemes?.bearerAuth;

  assert.equal(bearerAuth?.type, 'http');
  assert.equal(bearerAuth?.scheme, 'bearer');
  assert.equal(bearerAuth?.bearerFormat, 'JWT');

  for (const [path, method] of [
    ['/api/recipes', 'post'],
    ['/api/recipes/{id}', 'put'],
    ['/api/recipes/{id}', 'delete'],
  ] as const) {
    assert.deepEqual(getOperation(path, method).security, [{ bearerAuth: [] }]);
  }

  assert.equal(getOperation('/api/recipes', 'get').security, undefined);
  assert.equal(getOperation('/api/recipes/{id}', 'get').security, undefined);
  assert.equal(getOperation('/api/login', 'post').security, undefined);
});

test('GET /api-docs loads the Swagger UI', async () => {
  const app = express();
  setupSwagger(app);

  await request(app)
    .get('/api-docs')
    .expect(301)
    .expect('Location', '/api-docs/');

  const response = await request(app)
    .get('/api-docs/')
    .expect(200)
    .expect('Content-Type', /html/);

  assert.match(response.text, /Swagger UI/);

  await request(app)
    .get('/api-docs/swagger-ui.css')
    .expect(200)
    .expect('Content-Type', /css/);

  await request(app)
    .get('/api-docs/swagger-ui-bundle.js')
    .expect(200)
    .expect('Content-Type', /javascript/);
});

test('GET /api-docs.json exposes the generated OpenAPI document', async () => {
  const app = express();
  setupSwagger(app);

  const response = await request(app)
    .get('/api-docs.json')
    .expect(200)
    .expect('Content-Type', /json/);

  assert.equal(response.body.info.title, 'StitchLog API');
});
