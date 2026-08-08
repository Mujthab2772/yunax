import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IEmailService } from '../../../../infrastructure/notifications/IEmailService';
import crypto from 'crypto';
import { prisma } from '../../../../infrastructure/database/client';
import { ApiError } from '../../../../utils/ApiError';

export class ForgotPassword {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly emailService: IEmailService
  ) {}

  public async execute(email: string): Promise<string | undefined> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      // Do not reveal if email exists or not
      return;
    }

    // Generate secure 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const tokenHash = crypto.createHash('sha256').update(otp).digest('hex');

    // Token expires in 15 mins
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt
      }
    });

    const htmlBody = `
      <h1>Password Reset Verification</h1>
      <p>You requested a password reset. Here is your 6-digit verification code:</p>
      <h2 style="letter-spacing: 5px;">${otp}</h2>
      <p>This code expires in 15 minutes.</p>
    `;

    try {
      await this.emailService.sendEmail(
        user.email,
        'Password Reset OTP',
        htmlBody
      );
    } catch (e) {
      console.error('Failed to send reset email:', e);
    }
    
    // Pass OTP to controller for dev mode (optional, only if in dev)
    return process.env.NODE_ENV === 'development' ? otp : undefined;
  }
}
