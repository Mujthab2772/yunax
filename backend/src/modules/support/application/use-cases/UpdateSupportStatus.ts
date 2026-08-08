import { ISupportRepository } from '../../domain/repositories/ISupportRepository';
import { ApiError } from '../../../../utils/ApiError';

export class UpdateSupportStatus {
  constructor(private readonly supportRepository: ISupportRepository) {}

  public async execute(id: string, status: string) {
    const message = await this.supportRepository.getById(id);
    if (!message) {
      throw new ApiError(404, 'Support message not found');
    }

    message.status = status;
    return this.supportRepository.save(message);
  }
}
