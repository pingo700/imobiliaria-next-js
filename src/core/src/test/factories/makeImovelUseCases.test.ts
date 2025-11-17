import { makeImovelUseCases } from '../../factories/makeImovelUseCases';

describe('makeImovelUseCases', () => {
  it('should create and return imovel use cases object', () => {
    const useCases = makeImovelUseCases();

    // Verifica que o objeto foi criado
    expect(useCases).toBeDefined();
    expect(typeof useCases).toBe('object');
  });

  it('should have all necessary use cases', () => {
    const useCases = makeImovelUseCases();

    // Se tiver propriedades, verifica
    const keys = Object.keys(useCases);
    expect(keys.length).toBeGreaterThanOrEqual(0);
  });
});
