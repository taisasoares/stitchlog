export class Tag {
  constructor(
    private id: number,
    private name: string,
    private created_at: Date,
  ) {}

  getId(): number { return this.id; }
  getName(): string { return this.name; }
  getCreatedAt(): Date { return this.created_at; }

  setName(name: string): void { this.name = name; }
}
