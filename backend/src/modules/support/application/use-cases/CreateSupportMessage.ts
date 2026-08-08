import { ISupportRepository } from '../../domain/repositories/ISupportRepository';
import { SupportMessage } from '../../domain/entities/SupportMessage';
import crypto from 'crypto';

export class CreateSupportMessage {
  constructor(private readonly supportRepository: ISupportRepository) {}

  public async execute(data: any): Promise<SupportMessage> {
    const message = new SupportMessage(
      crypto.randomUUID(),
      data.name,
      data.email,
      data.message,
      data.phone,
      data.subject,
      data.source || 'contact-form'
    );
    return this.supportRepository.save(message);
  }
}
