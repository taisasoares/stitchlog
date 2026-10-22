export interface PublicUserData {
  id: number;
  name: string;
  email: string;
  created_at: Date;
}

export class User {
  constructor(
    private id: number,
    private name: string,
    private email: string,
    private password_hash: string,
    private password_reset_required: boolean,
    private created_at: Date,
  ) {}

  getId(): number { return this.id; }
  getName(): string { return this.name; }
  getEmail(): string { return this.email; }
  getPasswordHash(): string { return this.password_hash; }
  isPasswordResetRequired(): boolean { return this.password_reset_required; }
  getCreatedAt(): Date { return this.created_at; }

  setName(name: string): void { this.name = name; }
  setEmail(email: string): void { this.email = email; }

  toPublicData(): PublicUserData {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      created_at: this.created_at,
    };
  }

  toJSON(): PublicUserData {
    return this.toPublicData();
  }
}
