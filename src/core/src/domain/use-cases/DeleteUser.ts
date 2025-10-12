import { IUserRepository } from '../repositories/IUserRepository';

export class DeleteUser {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(params: { id: string }): Promise<void> {
    const { id } = params;

    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new Error('User not found');
    }

    await this.userRepository.delete(id);
  }
}
