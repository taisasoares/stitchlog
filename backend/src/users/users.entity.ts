export class User {
  constructor(
    private id: number,
    private name: string,
    private email: string,
    private created_at: Date,
  ) {}

  getId(): number { return this.id; }
  getName(): string { return this.name; }
  getEmail(): string { return this.email; }
  getCreatedAt(): Date { return this.created_at; }

  setName(name: string): void { this.name = name; }
  setEmail(email: string): void { this.email = email; }
}
