import { Request, Response, NextFunction } from 'express';
import { ITokenService } from '../../../application/ports/ITokenService';
import { ApiError } from '../../../../../utils/ApiError';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string;
      role?: string;
    };
  }
}

export class AuthMiddleware {
  constructor(private readonly tokenService: ITokenService) {}

  public requireAuth = (req: Request, res: Response, next: NextFunction) => {
    let token = req.cookies?.jwt;
    
    // Fallback to Bearer token if cookie is not present
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new ApiError(401, 'Unauthorized: No token provided'));
    }
    
    try {
      const payload = this.tokenService.verifyToken(token);
      if (!payload) {
         return next(new ApiError(401, 'Unauthorized: Invalid token'));
      }
      
      req.user = { id: payload.id, role: payload.role };
      next();
    } catch (error) {
      next(new ApiError(401, 'Unauthorized: Invalid token'));
    }
  };
}
