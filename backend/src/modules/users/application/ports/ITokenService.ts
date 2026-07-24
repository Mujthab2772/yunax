export interface ITokenService {
  generateToken(payload: Record<string, any>): string;
  verifyToken(token: string): Record<string, any> | null;
}
