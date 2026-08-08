import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IPasswordHasher } from '../ports/IPasswordHasher';
import { User, UserDTO } from '../../domain/entities/User';
import { ApiError } from '../../../../utils/ApiError';
import crypto from 'crypto';

import { ITokenService } from '../ports/ITokenService';

export class RegisterUser {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenService: ITokenService
  ) {}

  public async execute(data: any): Promise<{ token: string, user: UserDTO }> {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ApiError(400, 'User with this email already exists');
    }

    const hashedPassword = await this.passwordHasher.hash(data.password);
    
    const newId = crypto.randomUUID();
    const newUser = new User(newId, data.email, hashedPassword, data.name || '', data.role || 'customer');
    
    await this.userRepository.save(newUser);
    const token = this.tokenService.generateToken({ id: newUser.id, role: newUser.role });
    return { token, user: newUser.toDTO() };
  }
}
