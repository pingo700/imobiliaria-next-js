import { IImovelRepository } from '../domain/repositories/IImovelRepository';
import { IUserRepository } from '../domain/repositories/IUserRepository';
import { BorrowVinylRecord } from '../domain/use-cases/BorrowVinylRecord';
import { ReturnVinylRecord } from '../domain/use-cases/ReturnVinylRecord';
import { MockImovelRepository } from '../infra/mocks/MockImovelRepository';
import { MockUserRepository } from '../infra/mocks/MockUserRepository';

export function makeImovelUseCases() {
  const imovelRepository: IImovelRepository = MockImovelRepository.getInstance();
  const userRepository: IUserRepository = MockUserRepository.getInstance();
  

  const borrowVinylRecord = new BorrowVinylRecord(
    imovelRepository,
    userRepository
  );
  const returnVinylRecord = new ReturnVinylRecord(imovelRepository);

  return {
    borrowVinylRecord,
    returnVinylRecord,
  };
}
