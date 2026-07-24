import jwt from 'jsonwebtoken';
import { ITokenService } from '../../application/ports/ITokenService';

export class JwtTokenService implements ITokenService {
  private readonly secret = process.env['JWT_SECRET'] || 'super-secret-key';

  public generateToken(payload: Record<string, any>): string {
    return jwt.sign(payload, this.secret, { expiresIn: '1d' });
  }

  public verifyToken(token: string): Record<string, any> | null {
    try {
      return jwt.verify(token, this.secret) as Record<string, any>;
    } catch (error) {
      return null;
    }
  }
}
