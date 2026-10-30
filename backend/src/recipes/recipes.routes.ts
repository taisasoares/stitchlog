import { Router } from 'express';
import { requireAuth } from '../auth/requireAuth';
import { RecipesController } from './recipes.controller';

const router = Router();
const controller = new RecipesController();

/**
 * @openapi
 * /api/recipes:
 *   get:
 *     tags:
 *       - Recipes
 *     summary: Lista todas as receitas
 *     responses:
 *       200:
 *         description: Lista de receitas retornada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Recipe'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/recipes', controller.getAll);
router.get('/recipes/:id', controller.getById);
router.post('/recipes', requireAuth, controller.create);
router.put('/recipes/:id', requireAuth, controller.update);
router.delete('/recipes/:id', requireAuth, controller.remove);

export default router;
