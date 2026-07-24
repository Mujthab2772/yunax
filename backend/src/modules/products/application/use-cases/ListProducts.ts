import { IProductRepository } from '../../domain/repositories/IProductRepository';
import { Product } from '../../domain/entities/Product';
import { ProductQuery, PaginatedResult } from '../queries/ProductQuery';

export class ListProducts {
  constructor(private readonly productRepository: IProductRepository) {}

  public async execute(query: ProductQuery): Promise<PaginatedResult<Product>> {
    const safeQuery: ProductQuery = {
      ...query,
      page: query.page && query.page > 0 ? query.page : 1,
      limit: query.limit && query.limit > 0 ? query.limit : 10
    };
    
    return this.productRepository.listAll(safeQuery);
  }
}
