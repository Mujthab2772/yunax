export class Wishlist {
  constructor(
    public readonly userId: string,
    public readonly productIds: string[]
  ) {}
}
