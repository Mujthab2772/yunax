import { IUserRepository } from '../../domain/repositories/IUserRepository';
import crypto from 'crypto';
import { prisma } from '../../../../infrastructure/database/client';
import { ApiError } from '../../../../utils/ApiError';

export class VerifyResetOtp {
  constructor(private readonly userRepository: IUserRepository) {}

  public async execute(email: string, otp: string): Promise<string> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new ApiError(400, 'Invalid or expired OTP.');
    }

    const tokenHash = crypto.createHash('sha256').update(otp).digest('hex');

    const resetToken = await prisma.passwordResetToken.findFirst({
      where: { 
        userId: user.id,
        tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() }
      }
    });

    if (!resetToken) {
      throw new ApiError(400, 'Invalid or expired OTP.');
    }

    // Mark OTP as used to prevent reuse
    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() }
    });

    // Generate actual resetToken (32 bytes)
    const newResetToken = crypto.randomBytes(32).toString('hex');
    const newResetTokenHash = crypto.createHash('sha256').update(newResetToken).digest('hex');

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: newResetTokenHash,
        expiresAt
      }
    });

    return newResetToken;
  }
}
