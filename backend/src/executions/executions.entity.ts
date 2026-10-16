export type ExecutionStatus = 'not_started' | 'in_progress' | 'completed';

export class Execution {
  constructor(
    private id: number,
    private user_id: number,
    private user_name: string,
    private recipe_id: number,
    private recipe_title: string,
    private status: ExecutionStatus,
    private progress: number,
    private current_step_id: number | null,
    private started_at: Date,
    private updated_at: Date,
    private completed_at: Date | null,
  ) {}

  getId(): number { return this.id; }
  getUserId(): number { return this.user_id; }
  getUserName(): string { return this.user_name; }
  getRecipeId(): number { return this.recipe_id; }
  getRecipeTitle(): string { return this.recipe_title; }
  getStatus(): ExecutionStatus { return this.status; }
  getProgress(): number { return this.progress; }
  getCurrentStepId(): number | null { return this.current_step_id; }
  getStartedAt(): Date { return this.started_at; }
  getUpdatedAt(): Date { return this.updated_at; }
  getCompletedAt(): Date | null { return this.completed_at; }

  setStatus(status: ExecutionStatus): void { this.status = status; }
  setProgress(progress: number): void { this.progress = progress; }
  setCurrentStepId(currentStepId: number | null): void { this.current_step_id = currentStepId; }
  setUpdatedAt(updatedAt: Date): void { this.updated_at = updatedAt; }
  setCompletedAt(completedAt: Date | null): void { this.completed_at = completedAt; }
}
