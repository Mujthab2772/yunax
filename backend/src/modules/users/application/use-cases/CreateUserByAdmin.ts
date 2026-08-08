import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IPasswordHasher } from '../ports/IPasswordHasher';
import { User, UserRole } from '../../domain/entities/User';
import crypto from 'crypto';
import { ApiError } from '../../../../utils/ApiError';

export class CreateUserByAdmin {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher
  ) {}

  public async execute(data: any): Promise<any> {
    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) {
      throw new ApiError(400, 'User with this email already exists');
    }

    const hashedPassword = await this.passwordHasher.hash(data.password);
    
    const user = new User(
      crypto.randomUUID(),
      data.email,
      hashedPassword,
      data.name,
      (data.role as UserRole) || 'customer',
      false
    );

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
