import type { Request, Response, NextFunction } from 'express';
import { RegisterUser } from '../../application/use-cases/RegisterUser';
import { LoginUser } from '../../application/use-cases/LoginUser';
import { GetUserProfile } from '../../application/use-cases/GetUserProfile';
import { ForgotPassword } from '../../application/use-cases/ForgotPassword';
import { ResetPassword } from '../../application/use-cases/ResetPassword';
import { VerifyResetOtp } from '../../application/use-cases/VerifyResetOtp';
import { UpdateUserProfile } from '../../application/use-cases/UpdateUserProfile';
import { ApiError } from '../../../../utils/ApiError';

export class AuthController {
  constructor(
    private readonly registerUser: RegisterUser,
    private readonly loginUser: LoginUser,
    private readonly getUserProfile: GetUserProfile,
    private readonly updateUserProfile: UpdateUserProfile,
    private readonly forgotPasswordUseCase?: ForgotPassword,
    private readonly verifyResetOtpUseCase?: VerifyResetOtp,
    private readonly resetPasswordUseCase?: ResetPassword
  ) {}

  public register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.registerUser.execute(req.body);
      this.setTokenCookie(res, result.token);
      res.status(201).json({ user: result.user });
    } catch (error) {
      next(error); 
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.loginUser.execute(req.body);
      this.setTokenCookie(res, result.token);
      res.status(200).json({ user: result.user });
    } catch (error) {
      next(error);
    }
  };

  public getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const user = await this.getUserProfile.execute(userId);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  };

  public updateMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const data = {
        name: req.body.name,
        email: req.body.email
      };
      const user = await this.updateUserProfile.execute(userId, data);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  };

  public updateAddresses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const data = {
        addresses: req.body.addresses
      };
      const user = await this.updateUserProfile.execute(userId, data);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  };

  public adminLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.loginUser.execute(req.body);
      if (result.user.role !== 'admin') {
        throw new ApiError(403, 'This account is not authorized for admin access.');
      }
      this.setTokenCookie(res, result.token);
      res.status(200).json({ user: result.user });
    } catch (error) {
      next(error);
    }
  };

  public adminSignup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (process.env.ALLOW_ADMIN_SIGNUP !== 'true') {
        throw new ApiError(403, 'Admin signup is disabled.');
      }
      const body = { ...req.body, role: 'admin' };
      const result = await this.registerUser.execute(body);
      this.setTokenCookie(res, result.token);
      res.status(201).json({ user: result.user });
    } catch (error) {
      next(error);
    }
  };

  public logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.clearCookie('jwt', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  };

  public forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (this.forgotPasswordUseCase) {
        await this.forgotPasswordUseCase.execute(req.body.email);
      }
      res.status(200).json({ message: 'If the account exists, a password reset email has been sent.' });
    } catch (error) {
      next(error);
    }
  };

  public verifyResetOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let resetToken;
      if (this.verifyResetOtpUseCase) {
        resetToken = await this.verifyResetOtpUseCase.execute(req.body.email, req.body.otp);
      }
      res.status(200).json({ message: 'OTP verified successfully.', resetToken });
    } catch (error) {
      next(error);
    }
  };

  public resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (this.resetPasswordUseCase) {
        await this.resetPasswordUseCase.execute(req.body.token, req.body.password);
      }
      res.status(200).json({ message: 'Password has been successfully reset.' });
    } catch (error) {
      next(error);
    }
  };

  private setTokenCookie(res: Response, token: string) {
    if (!token) return;
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
  }
}
