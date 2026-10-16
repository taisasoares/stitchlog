import { Tag } from './tags.entity';
import { TagsRepository } from './tags.repository';

export class TagsService {
  private repository = new TagsRepository();

  async listAllTags(): Promise<Tag[]> {
    return this.repository.findAll();
  }
}
