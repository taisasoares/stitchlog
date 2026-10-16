import { Router } from 'express';
import { CategoriesController } from './categories.controller';

const router = Router();
const controller = new CategoriesController();

router.get('/categories', controller.getAll);

export default router;
