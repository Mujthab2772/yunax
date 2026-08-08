import { ISupportRepository } from '../../domain/repositories/ISupportRepository';
import { SupportMessage } from '../../domain/entities/SupportMessage';
import { prisma } from '../../../../infrastructure/database/client';

export class PrismaSupportRepository implements ISupportRepository {
  public async save(message: SupportMessage): Promise<SupportMessage> {
    const record = await prisma.supportMessage.upsert({
      where: { id: message.id },
      update: {
        status: message.status
      },
      create: {
        id: message.id,
        name: message.name,
        email: message.email,
        message: message.message,
        phone: message.phone || null,
        subject: message.subject || null,
        source: message.source || null,
        status: message.status,
        createdAt: message.createdAt
      }
    });
    return this.mapToEntity(record);
  }

  public async listAll(): Promise<SupportMessage[]> {
    const records = await prisma.supportMessage.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return records.map(record => this.mapToEntity(record));
  }

  public async getUnreadCount(): Promise<number> {
    return prisma.supportMessage.count({
      where: { status: 'new' }
    });
  }

  public async getById(id: string): Promise<SupportMessage | null> {
    const record = await prisma.supportMessage.findUnique({
      where: { id }
    });
    if (!record) return null;
    return this.mapToEntity(record);
  }

  private mapToEntity(record: any): SupportMessage {
    return new SupportMessage(
      record.id,
      record.name,
      record.email,
      record.message,
      record.phone,
      record.subject,
      record.source,
      record.status,
      record.createdAt
    );
  }
}
