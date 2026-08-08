import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User, UserRole } from '../../domain/entities/User';
import { prisma } from '../../../../infrastructure/database/client';

export class PrismaUserRepository implements IUserRepository {
  public async save(user: User): Promise<User> {
    const record = await prisma.user.upsert({
      where: { id: user.id },
      update: {
        email: user.email,
        passwordHash: user.passwordHash,
        name: user.name,
        role: user.role,
        isBanned: user.isBanned,
        addresses: user.addresses
      },
      create: {
        id: user.id,
        email: user.email,
        passwordHash: user.passwordHash,
        name: user.name,
        role: user.role,
        isBanned: user.isBanned,
        addresses: user.addresses
      }
    });
    return this.mapToEntity(record);
  }

  public async findByEmail(email: string): Promise<User | null> {
    const record = await prisma.user.findUnique({ where: { email } });
    if (!record) return null;
    return this.mapToEntity(record);
  }

  public async findById(id: string): Promise<User | null> {
    const record = await prisma.user.findUnique({ where: { id } });
    if (!record) return null;
    return this.mapToEntity(record);
  }

  public async countCustomers(): Promise<number> {
    return prisma.user.count({
      where: { role: 'customer' }
    });
  }

  public async listAll(): Promise<User[]> {
    const records = await prisma.user.findMany({
      orderBy: { email: 'asc' }
    });
    return records.map(record => this.mapToEntity(record));
  }

  public async delete(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } }).catch(() => {});
  }

  private mapToEntity(record: any): User {
    return new User(
      record.id,
      record.email,
      record.passwordHash,
      record.name,
      record.role as UserRole,
      record.isBanned,
      Array.isArray(record.addresses) ? record.addresses : (record.addresses ? [record.addresses] : [])
    );
  }
}
