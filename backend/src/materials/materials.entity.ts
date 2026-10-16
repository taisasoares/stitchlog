export type MaterialKind = 'material' | 'tool';

export class Material {
  constructor(
    private id: number,
    private name: string,
    private kind: MaterialKind,
    private created_at: Date,
  ) {}

  getId(): number { return this.id; }
  getName(): string { return this.name; }
  getKind(): MaterialKind { return this.kind; }
  getCreatedAt(): Date { return this.created_at; }

  setName(name: string): void { this.name = name; }
  setKind(kind: MaterialKind): void { this.kind = kind; }
}
