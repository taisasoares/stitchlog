import { Router } from 'express';
import { TagsController } from './tags.controller';

const router = Router();
const controller = new TagsController();

router.get('/tags', controller.getAll);

export default router;
