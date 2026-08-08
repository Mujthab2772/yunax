import { ICategoryRepository } from '../../domain/repositories/ICategoryRepository';
import { Category } from '../../domain/entities/Category';
import { prisma } from '../../../../infrastructure/database/client';

export class PrismaCategoryRepository implements ICategoryRepository {
  public async save(category: Category): Promise<Category> {
    const record = await prisma.category.create({
      data: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        image: category.image,
        description: category.description
      }
    });
    return this.mapToEntity(record);
  }

  public async update(category: Category): Promise<Category> {
    const record = await prisma.category.update({
      where: { id: category.id },
      data: {
        name: category.name,
        slug: category.slug,
        image: category.image,
        description: category.description
      }
    });
    return this.mapToEntity(record);
  }

  public async delete(id: string): Promise<void> {
    await prisma.category.delete({ where: { id } }).catch(() => {});
  }

  public async listAll(): Promise<Category[]> {
    const records = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    return records.map(this.mapToEntity);
  }

  public async getById(id: string): Promise<Category | null> {
    const record = await prisma.category.findUnique({ where: { id } });
    if (!record) return null;
    return this.mapToEntity(record);
  }

  public async getBySlug(slug: string): Promise<Category | null> {
    const record = await prisma.category.findUnique({ where: { slug } });
    if (!record) return null;
    return this.mapToEntity(record);
  }

  private mapToEntity(record: any): Category {
    return new Category(
      record.id,
      record.name,
      record.slug,
      record.image,
      record.description,
      record.createdAt,
      record.updatedAt
    );
  }
}
