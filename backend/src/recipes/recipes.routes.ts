import { Router } from 'express';
import { RecipesController } from './recipes.controller';

const router = Router();
const controller = new RecipesController();

router.get('/recipes', controller.getAll);

export default router;