import { MockUserRepository } from '../../../infra/mocks/MockUserRepository';
import { User } from '../../../domain/entities/User';
import { Name } from '../../../domain/value-objects/Name';
import { Email } from '../../../domain/value-objects/Email';
import { Password } from '../../../domain/value-objects/Password';

describe('MockUserRepository', () => {
  it('should not throw when updating a non-existent user', async () => {
    const userRepository = MockUserRepository.getInstance();
    const user = User.create(
      '1',
      Name.create('John Doe'),
      Email.create('john.doe@example.com'),
      Password.create('P@ssword1'),
    );

    await expect(userRepository.update(user)).resolves.not.toThrow();
  });
});
