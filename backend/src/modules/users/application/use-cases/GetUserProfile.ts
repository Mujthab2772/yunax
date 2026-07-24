import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { UserDTO } from '../../domain/entities/User';
import { ApiError } from '../../../../utils/ApiError';

export class GetUserProfile {
  constructor(private readonly userRepository: IUserRepository) {}

  public async execute(userId: string): Promise<UserDTO> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user.toDTO();
  }
}
