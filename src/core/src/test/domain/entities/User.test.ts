import { User } from '../../../domain/entities/User';
import { Email } from '../../../domain/value-objects/Email';
import { Name } from '../../../domain/value-objects/Name';
import { Password } from '../../../domain/value-objects/Password';

describe('User', () => {
  it('should create a valid user', () => {
    const user = User.create(
      '1',
      Name.create('John Doe'),
      Email.create('john.doe@example.com'),
      Password.create('P@ssword1'),
    );

    expect(user.id).toBe('1');
    expect(user.name.value).toBe('John Doe');
    expect(user.email.value).toBe('john.doe@example.com');
    expect(user.password.value).toBe('P@ssword1');
  });
});
