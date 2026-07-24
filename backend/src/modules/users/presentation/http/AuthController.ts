import type { Request, Response, NextFunction } from 'express';
import { RegisterUser } from '../../application/use-cases/RegisterUser';
import { LoginUser } from '../../application/use-cases/LoginUser';
import { GetUserProfile } from '../../application/use-cases/GetUserProfile';

export class AuthController {
  constructor(
    private readonly registerUser: RegisterUser,
    private readonly loginUser: LoginUser,
    private readonly getUserProfile: GetUserProfile
  ) {}

  public register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.registerUser.execute(req.body);
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      next(error); 
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.loginUser.execute(req.body);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  public getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // req.user is guaranteed to exist if AuthMiddleware passes
      const userId = req.user!.id;
      const user = await this.getUserProfile.execute(userId);
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  };
}
