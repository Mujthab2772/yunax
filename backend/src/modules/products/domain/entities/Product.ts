export class Product {
  constructor(
    public readonly id: string,
    public name: string,
    public description: string,
    public price: number,
    public stock_quantity: number,
    public category_id: string,
    public image_urls: string[]
  ) {}
}
