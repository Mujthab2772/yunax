export class Category {
  constructor(
    public readonly id: string,
    public name: string,
    public slug: string,
    public image: string | null,
    public description: string | null,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}
}
