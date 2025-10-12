import { MockImovelRepository } from '../../../infra/mocks/MockImovelRepository';
import { Imovel } from '../../../domain/entities/Imovel';

describe('MockImovelRepository', () => {
  it('should not throw when updating a non-existent imovel', async () => {
    const imovelRepository = MockImovelRepository.getInstance();
    const imovel = Imovel.create('1', 'user-1', 'record-1', new Date());

    await expect(imovelRepository.update(imovel)).resolves.not.toThrow();
  });
});
