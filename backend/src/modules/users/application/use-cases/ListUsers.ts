import { IUserRepository } from '../../domain/repositories/IUserRepository';

export class ListUsers {
  constructor(private readonly userRepository: IUserRepository) {}

  public async execute(): Promise<any[]> {
    const users = await this.userRepository.listAll();
    return users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      isBanned: u.isBanned
    }));
  }
}
