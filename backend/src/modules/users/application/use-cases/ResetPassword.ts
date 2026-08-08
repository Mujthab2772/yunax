import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IPasswordHasher } from '../ports/IPasswordHasher';
import crypto from 'crypto';
import { prisma } from '../../../../infrastructure/database/client';
import { ApiError } from '../../../../utils/ApiError';

export class ResetPassword {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher
  ) {}

  public async execute(token: string, password: string): Promise<void> {
    if (!token || !password) {
      throw new ApiError(400, 'Token and password are required');
    }

    if (password.length < 8) {
      throw new ApiError(400, 'Password must be at least 8 characters');
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash }
    });

    if (!resetToken) {
      throw new ApiError(400, 'Invalid or expired token');
    }

    if (resetToken.usedAt) {
      throw new ApiError(400, 'Token has already been used');
    }

    if (resetToken.expiresAt < new Date()) {
      throw new ApiError(400, 'Token has expired');
    }

    const user = await this.userRepository.findById(resetToken.userId);
    if (!user) {
      throw new ApiError(400, 'User not found');
    }

    user.passwordHash = await this.passwordHasher.hash(password);
    await this.userRepository.save(user);

    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() }
    });
  }
}
