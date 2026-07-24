import { CartItem } from './CartItem';
import { ApiError } from '../../../../utils/ApiError';

export class Cart {
  constructor(
    public readonly userId: string,
    public items: CartItem[] = []
  ) {}

  public addItem(productId: string, price: number, quantity: number = 1): void {
    if (quantity <= 0) throw new ApiError(400, 'Quantity must be greater than zero');

    const existingItem = this.items.find(item => item.productId === productId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push(new CartItem(productId, quantity, price));
    }
  }

  public removeItem(productId: string): void {
    this.items = this.items.filter(item => item.productId !== productId);
  }

  public updateQuantity(productId: string, newQuantity: number): void {
    if (newQuantity <= 0) {
      this.removeItem(productId);
      return;
    }

    const item = this.items.find(item => item.productId === productId);
    if (!item) {
      throw new ApiError(404, 'Item not found in cart');
    }

    item.quantity = newQuantity;
  }

  public totalPrice(): number {
    return this.items.reduce((total, item) => total + (item.priceAtTimeOfAdding * item.quantity), 0);
  }
}
