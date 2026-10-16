import { Step } from './steps.entity';
import { StepsRepository } from './steps.repository';

export class StepsService {
  private repository = new StepsRepository();

  async listAllSteps(): Promise<Step[]> {
    return this.repository.findAll();
  }
}
