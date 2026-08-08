import { IUserRepository } from '../../domain/repositories/IUserRepository';

export class DeleteUser {
  constructor(private readonly userRepository: IUserRepository) {}

  public async execute(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }
}
