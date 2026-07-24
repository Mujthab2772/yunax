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
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      create: {
        id: user.id,
        email: user.email,
        passwordHash: user.passwordHash,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
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

  private mapToEntity(record: any): User {
    return new User(
      record.id,
      record.email,
      record.passwordHash,
      record.firstName,
      record.lastName,
      record.role as UserRole
    );
  }
}
