import assert from 'node:assert/strict';
import test from 'node:test';
import express from 'express';
import request from 'supertest';
import { Category } from '../categories/categories.entity';
import { errorHandler } from '../errors/errorHandler';
import { RecipesController } from './recipes.controller';
import { Recipe } from './recipes.entity';
import { RecipesService } from './recipes.service';

const validRecipeInput = {
  title: 'Receita atualizada',
  description: 'Descrição atualizada.',
  difficulty: 'Intermediário',
  categoryId: 1,
};

function createTestApp() {
  let recipe: Recipe | null = new Recipe(
    1,
    'Amigurumi de coelho',
    'Receita para iniciantes.',
    'Fácil',
    'Amigurumi',
    'Taisa',
    new Date('2026-01-01T00:00:00.000Z'),
  );
  const service = new RecipesService({
    findAll: async () => recipe ? [recipe] : [],
    findById: async (id) => id === 1 ? recipe : null,
    findOwnerIdById: async (id) => id === 1 && recipe ? 7 : id === 2 ? 8 : null,
    create: async (data) => {
      assert.equal(data.userId, 7);
      return new Recipe(
        2,
        data.title,
        data.description,
        data.difficulty,
        'Amigurumi',
        'Usuária autenticada',
        new Date('2026-01-02T00:00:00.000Z'),
      );
    },
    update: async (id, userId, data) => {
      assert.equal(id, 1);
      assert.equal(userId, 7);
      return new Recipe(
        id,
        data.title,
        data.description,
        data.difficulty,
        'Amigurumi',
        'Usuária autenticada',
        new Date('2026-01-01T00:00:00.000Z'),
      );
    },
    delete: async (id, userId) => {
      if (id !== 1 || userId !== 7 || !recipe) return false;
      recipe = null;
      return true;
    },
  }, {
    findById: async (id) => id === 1
      ? new Category(1, 'Amigurumi', new Date('2026-01-01T00:00:00.000Z'))
      : null,
  });
  const controller = new RecipesController(service);
  const app = express();
  const authenticate = (
    req: express.Request,
    _res: express.Response,
    next: express.NextFunction,
  ) => {
    req.auth = { userId: 7 };
    next();
  };

  app.use(express.json());
  app.get('/api/recipes/:id', controller.getById);
  app.post('/api/recipes', authenticate, controller.create);
  app.put('/api/recipes/:id', authenticate, controller.update);
  app.delete('/api/recipes/:id', authenticate, controller.remove);
  app.use(errorHandler);

  return app;
}

test('GET /api/recipes/:id returns an existing recipe', async () => {
  const response = await request(createTestApp())
    .get('/api/recipes/1')
    .expect(200);

  assert.deepEqual(response.body, {
    id: 1,
    title: 'Amigurumi de coelho',
    description: 'Receita para iniciantes.',
    difficulty: 'Fácil',
    category: 'Amigurumi',
    creator_name: 'Taisa',
    created_at: '2026-01-01T00:00:00.000Z',
  });
});

test('GET /api/recipes/:id returns 404 for a missing recipe', async () => {
  const response = await request(createTestApp())
    .get('/api/recipes/999')
    .expect(404);

  assert.deepEqual(response.body, {
    error: {
      code: 'RECIPE_NOT_FOUND',
      message: 'Receita não encontrada.',
    },
  });
});

test('GET /api/recipes/:id returns 400 for an invalid ID', async () => {
  const response = await request(createTestApp())
    .get('/api/recipes/abc')
    .expect(400);

  assert.equal(response.body.error.code, 'INVALID_RECIPE_ID');
});

test('POST /api/recipes creates a recipe for the authenticated user', async () => {
  const response = await request(createTestApp())
    .post('/api/recipes')
    .send({
      title: 'Nova receita',
      description: 'Descrição da receita.',
      difficulty: 'Fácil',
      categoryId: 1,
    })
    .expect(201);

  assert.equal(response.body.title, 'Nova receita');
  assert.equal(response.body.category, 'Amigurumi');
});

test('POST /api/recipes returns 400 when required data is missing', async () => {
  const response = await request(createTestApp())
    .post('/api/recipes')
    .send({ description: 'Sem título.', categoryId: 1 })
    .expect(400);

  assert.equal(response.body.error.code, 'INVALID_RECIPE_DATA');
});

test('POST /api/recipes returns 404 when the category does not exist', async () => {
  const response = await request(createTestApp())
    .post('/api/recipes')
    .send({ title: 'Nova receita', difficulty: 'Fácil', categoryId: 999 })
    .expect(404);

  assert.equal(response.body.error.code, 'CATEGORY_NOT_FOUND');
});

test('PUT /api/recipes/:id updates a recipe owned by the authenticated user', async () => {
  const response = await request(createTestApp())
    .put('/api/recipes/1')
    .send(validRecipeInput)
    .expect(200);

  assert.equal(response.body.title, 'Receita atualizada');
});

test('PUT /api/recipes/:id returns 404 when the recipe does not exist', async () => {
  const response = await request(createTestApp())
    .put('/api/recipes/999')
    .send(validRecipeInput)
    .expect(404);

  assert.equal(response.body.error.code, 'RECIPE_NOT_FOUND');
});

test('PUT /api/recipes/:id forbids updates by another user', async () => {
  const response = await request(createTestApp())
    .put('/api/recipes/2')
    .send(validRecipeInput)
    .expect(403);

  assert.equal(response.body.error.code, 'FORBIDDEN');
});

test('DELETE /api/recipes/:id removes a recipe owned by the authenticated user', async () => {
  const app = createTestApp();

  await request(app).delete('/api/recipes/1').expect(204);
  await request(app).get('/api/recipes/1').expect(404);
});

test('DELETE /api/recipes/:id returns 404 when the recipe does not exist', async () => {
  await request(createTestApp())
    .delete('/api/recipes/999')
    .expect(404);
});

test('DELETE /api/recipes/:id forbids deletion by another user', async () => {
  await request(createTestApp())
    .delete('/api/recipes/2')
    .expect(403);
});
