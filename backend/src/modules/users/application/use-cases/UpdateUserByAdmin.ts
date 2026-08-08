import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IPasswordHasher } from '../ports/IPasswordHasher';
import { ApiError } from '../../../../utils/ApiError';

export class UpdateUserByAdmin {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher
  ) {}

  public async execute(id: string, data: any): Promise<any> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (data.email && data.email !== user.email) {
      const existing = await this.userRepository.findByEmail(data.email);
      if (existing) throw new ApiError(400, 'User with this email already exists');
      user.email = data.email;
    }

    if (data.name !== undefined) user.name = data.name;
    if (data.role !== undefined) user.role = data.role;
    
    // Removed password changing capabilities for admins (Security Audit Fix)

    const saved = await this.userRepository.save(user);
    
    return {
      id: saved.id,
      name: saved.name,
      email: saved.email,
      role: saved.role,
      isBanned: saved.isBanned
    };
  }
}
