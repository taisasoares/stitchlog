import { Material } from './materials.entity';
import { MaterialsRepository } from './materials.repository';

export class MaterialsService {
  private repository = new MaterialsRepository();

  async listAllMaterials(): Promise<Material[]> {
    return this.repository.findAll();
  }
}
