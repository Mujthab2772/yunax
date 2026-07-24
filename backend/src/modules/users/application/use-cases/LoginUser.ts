import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IPasswordHasher } from '../ports/IPasswordHasher';
import { ITokenService } from '../ports/ITokenService';
import { UserDTO } from '../../domain/entities/User';
import { ApiError } from '../../../../utils/ApiError';

export interface LoginResponse {
  token: string;
  user: UserDTO;
}

export class LoginUser {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenService: ITokenService
  ) {}

  public async execute(data: any): Promise<LoginResponse> {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const isPasswordValid = await this.passwordHasher.compare(data.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const token = this.tokenService.generateToken({ id: user.id, role: user.role });
    
    return {
      token,
      user: user.toDTO(),
    };
  }
}
