import { Router } from 'express';
import { requireAuth } from '../auth/requireAuth';
import { RecipesController } from './recipes.controller';

const router = Router();
const controller = new RecipesController();

router.get('/recipes', controller.getAll);
router.get('/recipes/:id', controller.getById);
router.post('/recipes', requireAuth, controller.create);
router.put('/recipes/:id', requireAuth, controller.update);
router.delete('/recipes/:id', requireAuth, controller.remove);

export default router;
