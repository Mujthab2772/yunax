import { User } from '../entities/User';

export interface IUserRepository {
  save(user: User): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  countCustomers(): Promise<number>;
  listAll(): Promise<User[]>;
  delete(id: string): Promise<void>;
}
