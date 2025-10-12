import { FindUser } from '../../../domain/use-cases/FindUser';
import { RegisterUser } from '../../../domain/use-cases/RegisterUser';
import { MockUserRepository } from '../../../infra/mocks/MockUserRepository';

describe('FindUser', () => {
  it('should find a user by id', async () => {
    const userRepository = MockUserRepository.getInstance();
    const registerUser = new RegisterUser(userRepository);
    const findUser = new FindUser(userRepository);

    const user = await registerUser.execute({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'P@ssword1',
    });

    const foundUser = await findUser.execute({ id: user.id });

    expect(foundUser).toBe(user);
  });

  it('should return null if the user is not found', async () => {
    const userRepository = MockUserRepository.getInstance();
    const findUser = new FindUser(userRepository);

    const foundUser = await findUser.execute({ id: '1' });

    expect(foundUser).toBeNull();
  });
});
