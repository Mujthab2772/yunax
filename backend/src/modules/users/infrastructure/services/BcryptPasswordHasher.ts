import bcrypt from 'bcryptjs';
import { IPasswordHasher } from '../../application/ports/IPasswordHasher';

export class BcryptPasswordHasher implements IPasswordHasher {
  public async hash(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  public async compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
}
