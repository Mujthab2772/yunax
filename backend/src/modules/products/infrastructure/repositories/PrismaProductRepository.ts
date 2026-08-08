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
        slug: product.slug,
        description: product.description,
        priceCents: product.priceCents,
        stock: product.stock,
        category: product.category,
        images: product.images
      },
      create: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        priceCents: product.priceCents,
        stock: product.stock,
        category: product.category,
        images: product.images
      }
    });
    return this.mapToEntity(record);
  }

  public async getById(idOrSlug: string): Promise<Product | null> {
    const record = await prisma.product.findFirst({ 
      where: { 
        OR: [
          { id: idOrSlug },
          { slug: idOrSlug }
        ]
      } 
    });
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
      where.category = query.categoryId;
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.priceCents = {};
      if (query.minPrice !== undefined) where.priceCents.gte = query.minPrice;
      if (query.maxPrice !== undefined) where.priceCents.lte = query.maxPrice;
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
    const records = await prisma.product.findMany({ where: { category: categoryId } });
    return records.map(this.mapToEntity);
  }

  public async updateStock(id: string, amount: number): Promise<Product> {
    const record = await prisma.product.update({
      where: { id },
      data: { stock: { increment: amount } }
    });
    return this.mapToEntity(record);
  }

  public async update(product: Product): Promise<Product> {
    const record = await prisma.product.update({
      where: { id: product.id },
      data: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        priceCents: product.priceCents,
        stock: product.stock,
        category: product.category,
        images: product.images
      }
    });
    return this.mapToEntity(record);
  }

  public async delete(id: string): Promise<void> {
    await prisma.product.delete({ where: { id } });
  }

  private mapToEntity(record: any): Product {
    return new Product(
      record.id,
      record.name,
      record.slug,
      record.description,
      record.priceCents,
      record.stock,
      record.category,
      record.images
    );
  }
}
