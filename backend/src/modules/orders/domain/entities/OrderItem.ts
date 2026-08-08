export class OrderItem {
  constructor(
    public readonly productId: string,
    public readonly name: string,
    public readonly priceCents: number,
    public readonly quantity: number
  ) {}
}
