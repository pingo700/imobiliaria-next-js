import { RegisterUser } from '../../../domain/use-cases/RegisterUser';
import { MockUserRepository } from '../../../infra/mocks/MockUserRepository';

describe('RegisterUser', () => {
  it('should register a new user', async () => {
    const userRepository = MockUserRepository.getInstance();
    const registerUser = new RegisterUser(userRepository);

    const user = await registerUser.execute({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'P@ssword1',
    });

    expect(user).toBeDefined();
    expect(user.name.value).toBe('John Doe');
    expect(user.email.value).toBe('john.doe@example.com');

    const foundUser = await userRepository.findByEmail('john.doe@example.com');
    expect(foundUser).toBe(user);
  });

  it('should throw an error if the user already exists', async () => {
    const userRepository = MockUserRepository.getInstance();
    const registerUser = new RegisterUser(userRepository);

    await registerUser.execute({
      name: 'John Doe',
      email: 'john.doe10@example.com',
      password: 'P@ssword1',
    });

    await expect(
      registerUser.execute({
        name: 'Jane Doe',
        email: 'john.doe10@example.com',
        password: 'password456',
      })
    ).rejects.toThrow('User already exists');
  });
});
