import { Router } from 'express';
import { requireAuth } from '../auth/requireAuth';
import { UsersController } from './users.controller';

const router = Router();
const controller = new UsersController();

router.get('/users', controller.getAll);
router.get('/users/:id', controller.getById);
router.post('/users', controller.create);
router.put('/users/:id', requireAuth, controller.update);
router.delete('/users/:id', requireAuth, controller.remove);

export default router;
