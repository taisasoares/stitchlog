import { NextFunction, Request, Response } from 'express';
import { TagsService } from './tags.service';

export class TagsController {
  private service = new TagsService();

  getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tags = await this.service.listAllTags();
      res.json(tags);
    } catch (error) {
      next(error);
    }
  };
}
