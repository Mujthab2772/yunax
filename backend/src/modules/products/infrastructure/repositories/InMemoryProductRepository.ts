import { IProductRepository } from '../../domain/repositories/IProductRepository';
import { Product } from '../../domain/entities/Product';
import { ProductQuery, PaginatedResult } from '../../application/queries/ProductQuery';

export class InMemoryProductRepository implements IProductRepository {
  // Temporary database array
  private products: Product[] = [
    new Product('1', 'Laptop', 'laptop', 'High-performance laptop', 120000, 50, 'electronics', []),
    new Product('2', 'Headphones', 'headphones', 'Noise-cancelling headphones', 25000, 100, 'electronics', []),
    new Product('3', 'Keyboard', 'keyboard', 'Mechanical keyboard', 15000, 75, 'peripherals', []),
    new Product('4', 'Desk Chair', 'desk-chair', 'Ergonomic office chair', 30000, 20, 'furniture', [])
  ];

  public async save(product: Product): Promise<Product> {
    const existingIndex = this.products.findIndex(p => p.id === product.id);
    if (existingIndex >= 0) {
      this.products[existingIndex] = product;
    } else {
      this.products.push(product);
    }
    return product;
  }

  public async getById(id: string): Promise<Product | null> {
    const product = this.products.find((p) => p.id === id);
    return product || null;
  }

  public async listAll(query: ProductQuery): Promise<PaginatedResult<Product>> {
    let filtered = this.products;

    if (query.search) {
      const s = query.search.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s));
    }

    if (query.categoryId) {
      filtered = filtered.filter(p => p.category === query.categoryId);
    }

    if (query.minPrice !== undefined) {
      filtered = filtered.filter(p => p.priceCents >= query.minPrice!);
    }
    
    if (query.maxPrice !== undefined) {
      filtered = filtered.filter(p => p.priceCents <= query.maxPrice!);
    }

    const totalCount = filtered.length;
    
    const startIndex = (query.page - 1) * query.limit;
    const paginated = filtered.slice(startIndex, startIndex + query.limit);

    return {
      data: paginated,
      totalCount
    };
  }

  public async getByCategory(categoryId: string): Promise<Product[]> {
    return this.products.filter((p) => p.category === categoryId);
  }

  public async updateStock(id: string, newStock: number): Promise<Product> {
    const productIndex = this.products.findIndex((p) => p.id === id);
    
    if (productIndex === -1) {
      throw new Error('Product not found in repository');
    }

    const product = this.products[productIndex]!;
    product.stock = newStock;
    return product;
  }

  public async update(product: Product): Promise<Product> {
    return this.save(product);
  }

  public async delete(id: string): Promise<void> {
    this.products = this.products.filter(p => p.id !== id);
  }
}
