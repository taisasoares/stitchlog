export class Recipe {
  constructor(
    private id: number,
    private title: string,
    private description: string | null,
    private difficulty: string,
    private category: string,
    private creator_name: string,
    private created_at: Date,
  ) {}

  getId(): number { return this.id; }
  getTitle(): string { return this.title; }
  getDescription(): string | null { return this.description; }
  getDifficulty(): string { return this.difficulty; }
  getCategory(): string { return this.category; }
  getCreatorName(): string { return this.creator_name; }
  getCreatedAt(): Date { return this.created_at; }

  setTitle(title: string): void { this.title = title; }
  setDescription(description: string | null): void { this.description = description; }
  setDifficulty(difficulty: string): void { this.difficulty = difficulty; }
  setCategory(category: string): void { this.category = category; }
}
