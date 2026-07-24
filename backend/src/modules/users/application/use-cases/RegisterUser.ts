import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IPasswordHasher } from '../ports/IPasswordHasher';
import { User, UserDTO } from '../../domain/entities/User';
import { ApiError } from '../../../../utils/ApiError';
import crypto from 'crypto';

export class RegisterUser {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher
  ) {}

  public async execute(data: any): Promise<UserDTO> {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ApiError(400, 'User with this email already exists');
    }

    const hashedPassword = await this.passwordHasher.hash(data.password);
    
    const newId = crypto.randomUUID();
    const newUser = new User(newId, data.email, hashedPassword, data.firstName, data.lastName);
    
    await this.userRepository.save(newUser);
    return newUser.toDTO();
  }
}
