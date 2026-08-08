export class Product {
  constructor(
    public readonly id: string,
    public name: string,
    public slug: string,
    public description: string,
    public priceCents: number,
    public stock: number,
    public category: string,
    public images: string[]
  ) {}
}
