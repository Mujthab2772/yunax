import { ISupportRepository } from '../../domain/repositories/ISupportRepository';
import { SupportMessage } from '../../domain/entities/SupportMessage';

export class ListSupportMessages {
  constructor(private readonly supportRepository: ISupportRepository) {}

  public async execute(): Promise<SupportMessage[]> {
    return this.supportRepository.listAll();
  }
}
