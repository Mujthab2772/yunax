import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';

export class InMemoryUserRepository implements IUserRepository {
  private users: User[] = [];

  public async save(user: User): Promise<User> {
    const existingIndex = this.users.findIndex((u) => u.id === user.id);
    
    if (existingIndex >= 0) {
      this.users[existingIndex] = user;
    } else {
      this.users.push(user);
    }
    
    return user;
  }

  public async findByEmail(email: string): Promise<User | null> {
    const user = this.users.find((u) => u.email === email);
    return user || null;
  }

  public async findById(id: string): Promise<User | null> {
    const user = this.users.find((u) => u.id === id);
    return user || null;
  }

  public async countCustomers(): Promise<number> {
    return this.users.filter(u => u.role === 'customer').length;
  }
}
