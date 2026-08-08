import { ISupportRepository } from '../../domain/repositories/ISupportRepository';

export class GetUnreadSupportCount {
  constructor(private readonly supportRepository: ISupportRepository) {}

  public async execute(): Promise<{ count: number }> {
    const count = await this.supportRepository.getUnreadCount();
    return { count };
  }
}
