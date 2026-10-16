import { NextFunction, Request, Response } from 'express';
import { MaterialsService } from './materials.service';

export class MaterialsController {
  private service = new MaterialsService();

  getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const materials = await this.service.listAllMaterials();
      res.json(materials);
    } catch (error) {
      next(error);
    }
  };
}
