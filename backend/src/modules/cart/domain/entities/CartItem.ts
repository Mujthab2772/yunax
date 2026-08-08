export class CartItem {
  constructor(
    public readonly productId: string,
    public quantity: number,
    public readonly priceAtTimeOfAdding: number,
    public product?: any
  ) {}
}
