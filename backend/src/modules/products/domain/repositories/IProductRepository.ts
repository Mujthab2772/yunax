import { Product } from '../entities/Product';
import { ProductQuery, PaginatedResult } from '../../application/queries/ProductQuery';

export interface IProductRepository {
  save(product: Product): Promise<Product>;
  getById(id: string): Promise<Product | null>;
  listAll(query: ProductQuery): Promise<PaginatedResult<Product>>;
  getByCategory(categoryId: string): Promise<Product[]>;
  updateStock(id: string, newStock: number): Promise<Product>;
  update(product: Product): Promise<Product>;
  delete(id: string): Promise<void>;
}
