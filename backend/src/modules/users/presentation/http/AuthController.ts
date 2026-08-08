import type { Request, Response, NextFunction } from 'express';
import { RegisterUser } from '../../application/use-cases/RegisterUser';
import { LoginUser } from '../../application/use-cases/LoginUser';
import { GetUserProfile } from '../../application/use-cases/GetUserProfile';
import { ApiError } from '../../../../utils/ApiError';

export class AuthController {
  constructor(
    private readonly registerUser: RegisterUser,
    private readonly loginUser: LoginUser,
    private readonly getUserProfile: GetUserProfile
  ) {}

  public register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.registerUser.execute(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error); 
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.loginUser.execute(req.body);
      res.status(200).json(result);
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

  public adminLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.loginUser.execute(req.body);
      if (result.user.role !== 'admin') {
        throw new ApiError(403, 'This account is not authorized for admin access.');
      }
      res.status(200).json(result);
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
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };
}
