import { Router } from 'express';
import { ExecutionsController } from './executions.controller';

const router = Router();
const controller = new ExecutionsController();

router.get('/executions', controller.getAll);

export default router;
