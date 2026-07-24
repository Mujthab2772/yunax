import { IProductRepository } from '../../domain/repositories/IProductRepository';
import { Product } from '../../domain/entities/Product';
import { ProductQuery, PaginatedResult } from '../../application/queries/ProductQuery';
import { prisma } from '../../../../infrastructure/database/client';

export class PrismaProductRepository implements IProductRepository {
  public async save(product: Product): Promise<Product> {
    const record = await prisma.product.upsert({
      where: { id: product.id },
      update: {
        name: product.name,
        description: product.description,
        price: product.price,
        stockQuantity: product.stock_quantity,
        categoryId: product.category_id,
        imageUrls: product.image_urls
      },
      create: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        stockQuantity: product.stock_quantity,
        categoryId: product.category_id,
        imageUrls: product.image_urls
      }
    });
    return this.mapToEntity(record);
  }

  public async getById(id: string): Promise<Product | null> {
    const record = await prisma.product.findUnique({ where: { id } });
    if (!record) return null;
    return this.mapToEntity(record);
  }

  public async listAll(query: ProductQuery): Promise<PaginatedResult<Product>> {
    const where: any = {};

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } }
      ];
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {};
      if (query.minPrice !== undefined) where.price.gte = query.minPrice;
      if (query.maxPrice !== undefined) where.price.lte = query.maxPrice;
    }

    const [totalCount, records] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { createdAt: 'desc' }
      })
    ]);

    return {
      data: records.map(record => this.mapToEntity(record)),
      totalCount
    };
  }

  public async getByCategory(categoryId: string): Promise<Product[]> {
    const records = await prisma.product.findMany({ where: { categoryId } });
    return records.map(this.mapToEntity);
  }

  public async updateStock(id: string, amount: number): Promise<Product> {
    const record = await prisma.product.update({
      where: { id },
      data: { stockQuantity: { increment: amount } }
    });
    return this.mapToEntity(record);
  }

  public async update(product: Product): Promise<Product> {
    const record = await prisma.product.update({
      where: { id: product.id },
      data: {
        name: product.name,
        description: product.description,
        price: product.price,
        stockQuantity: product.stock_quantity,
        categoryId: product.category_id,
        imageUrls: product.image_urls
      }
    });
    return this.mapToEntity(record);
  }

  public async delete(id: string): Promise<void> {
    await prisma.product.delete({ where: { id } }).catch(() => {});
  }

  private mapToEntity(record: any): Product {
    return new Product(
      record.id,
      record.name,
      record.description,
      record.price,
      record.stockQuantity,
      record.categoryId,
      record.imageUrls
    );
  }
}
