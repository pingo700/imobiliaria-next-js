import { makeImovelUseCases } from '../../factories/makeImovelUseCases';

describe('makeImovelUseCases', () => {
  it('should create and return all imovel use cases', () => {
    const useCases = makeImovelUseCases();

    expect(useCases.borrowVinylRecord).toBeDefined();
    expect(useCases.returnVinylRecord).toBeDefined();
  });
});
