import { Router } from 'express';
import { StepsController } from './steps.controller';

const router = Router();
const controller = new StepsController();

router.get('/steps', controller.getAll);

export default router;
