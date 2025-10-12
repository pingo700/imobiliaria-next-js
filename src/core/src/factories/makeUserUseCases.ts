import { IUserRepository } from '../domain/repositories/IUserRepository';
import { DeleteUser } from '../domain/use-cases/DeleteUser';
import { FindUser } from '../domain/use-cases/FindUser';
import { LoginUser } from '../domain/use-cases/LoginUser';
import { RegisterUser } from '../domain/use-cases/RegisterUser';
import { UpdateUser } from '../domain/use-cases/UpdateUser';
import { MockUserRepository } from '../infra/mocks/MockUserRepository';

export function makeUserUseCases() {
  const userRepository: IUserRepository = MockUserRepository.getInstance();

  const registerUser = new RegisterUser(userRepository);
  const loginUser = new LoginUser(userRepository);
  const updateUser = new UpdateUser(userRepository);
  const deleteUser = new DeleteUser(userRepository);
  const findUser = new FindUser(userRepository);

  return {
    registerUser,
    loginUser,
    updateUser,
    deleteUser,
    findUser,
  };
}
