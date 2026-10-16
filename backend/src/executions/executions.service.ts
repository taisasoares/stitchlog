import { Execution } from './executions.entity';
import { ExecutionsRepository } from './executions.repository';

export class ExecutionsService {
  private repository = new ExecutionsRepository();

  async listAllExecutions(): Promise<Execution[]> {
    return this.repository.findAll();
  }
}
