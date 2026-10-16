import { User } from './users.entity';
import { UsersRepository } from './users.repository';

export class UsersService {
  private repository = new UsersRepository();

  async listAllUsers(): Promise<User[]> {
    return this.repository.findAll();
  }
}
