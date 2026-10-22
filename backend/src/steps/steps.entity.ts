export class Step {
  constructor(
    private id: number,
    private recipe_id: number,
    private recipe_title: string,
    private position: number,
    private instruction: string,
    private stitch_types: string | null,
    private created_at: Date,
  ) {}

  getId(): number { return this.id; }
  getRecipeId(): number { return this.recipe_id; }
  getRecipeTitle(): string { return this.recipe_title; }
  getPosition(): number { return this.position; }
  getInstruction(): string { return this.instruction; }
  getStitchTypes(): string | null { return this.stitch_types; }
  getCreatedAt(): Date { return this.created_at; }

  setPosition(position: number): void { this.position = position; }
  setInstruction(instruction: string): void { this.instruction = instruction; }
  setStitchTypes(stitchTypes: string | null): void { this.stitch_types = stitchTypes; }
}
