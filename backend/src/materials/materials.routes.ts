import { Router } from 'express';
import { MaterialsController } from './materials.controller';

const router = Router();
const controller = new MaterialsController();

router.get('/materials', controller.getAll);

export default router;
