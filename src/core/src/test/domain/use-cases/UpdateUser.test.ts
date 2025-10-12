import { UpdateUser } from '../../../domain/use-cases/UpdateUser';
import { RegisterUser } from '../../../domain/use-cases/RegisterUser';
import { MockUserRepository } from '../../../infra/mocks/MockUserRepository';

describe('UpdateUser', () => {
  it('should update a user', async () => {
    const userRepository = MockUserRepository.getInstance();
    const registerUser = new RegisterUser(userRepository);
    const updateUser = new UpdateUser(userRepository);

    const user = await registerUser.execute({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'P@ssword1',
    });

    const updatedUser = await updateUser.execute({
      id: user.id,
      name: 'John Doe Updated',
    });

    expect(updatedUser.name.value).toBe('John Doe Updated');
  });

  it('should throw an error if the user is not found', async () => {
    const userRepository = MockUserRepository.getInstance();
    const updateUser = new UpdateUser(userRepository);

    await expect(
      updateUser.execute({
        id: '1',
        name: 'John Doe Updated',
      })
    ).rejects.toThrow('User not found');
  });

  it('should not update user fields if they are not provided', async () => {
    const userRepository = MockUserRepository.getInstance();
    const registerUser = new RegisterUser(userRepository);
    const updateUser = new UpdateUser(userRepository);

    const user = await registerUser.execute({
      name: 'John Doe',
      email: 'john.doe2@example.com',
      password: 'P@ssword1',
    });

    const updatedUser = await updateUser.execute({
      id: user.id,
    });

    expect(updatedUser.name.value).toBe('John Doe');
    expect(updatedUser.email.value).toBe('john.doe2@example.com');
  });

  it('should update only the email', async () => {
    const userRepository = MockUserRepository.getInstance();
    const registerUser = new RegisterUser(userRepository);
    const updateUser = new UpdateUser(userRepository);

    const user = await registerUser.execute({
      name: 'John Doe',
      email: 'john.doe3@example.com',
      password: 'P@ssword1',
    });

    const updatedUser = await updateUser.execute({
      id: user.id,
      email: 'updated.email@example.com',
    });

    expect(updatedUser.name.value).toBe('John Doe');
    expect(updatedUser.email.value).toBe('updated.email@example.com');
  });

  it('should update only the location', async () => {
    const userRepository = MockUserRepository.getInstance();
    const registerUser = new RegisterUser(userRepository);
    const updateUser = new UpdateUser(userRepository);

    const user = await registerUser.execute({
      name: 'John Doe',
      email: 'john.doe4@example.com',
      password: 'P@ssword1',
    });

    const updatedUser = await updateUser.execute({
      id: user.id,
    });

    expect(updatedUser.name.value).toBe('John Doe');
    expect(updatedUser.email.value).toBe('john.doe4@example.com');
  });
});
