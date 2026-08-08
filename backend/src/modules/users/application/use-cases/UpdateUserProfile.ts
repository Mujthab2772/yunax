import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { UserDTO } from '../../domain/entities/User';
import { ApiError } from '../../../../utils/ApiError';

export interface UpdateUserProfileDTO {
  name?: string;
  email?: string;
  addresses?: any[];
}

export class UpdateUserProfile {
  constructor(private readonly userRepository: IUserRepository) {}

  public async execute(userId: string, data: UpdateUserProfileDTO): Promise<UserDTO> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (data.email && data.email !== user.email) {
      const existing = await this.userRepository.findByEmail(data.email);
      if (existing) {
        throw new ApiError(409, 'Email is already in use');
      }
      user.email = data.email;
    }

    if (data.name !== undefined) {
      user.name = data.name;
    }
    
    if (data.addresses !== undefined) {
      user.addresses = data.addresses;
    }

    const updatedUser = await this.userRepository.save(user);
    return updatedUser.toDTO();
  }
}
