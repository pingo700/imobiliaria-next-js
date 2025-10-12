import { Imovel } from '../../../domain/entities/Imovel';

describe('Imovel', () => {
  it('should create a valid imovel', () => {
    const imovel = Imovel.create('1', 'user-1', 'record-1', new Date());

    expect(imovel.id).toBe('1');
    expect(imovel.userId).toBe('user-1');
    expect(imovel.vinylRecordId).toBe('record-1');
    expect(imovel.loanDate).toBe(imovel.loanDate);
    expect(imovel.returnDate).toBeUndefined();
  });

  it('should return an imovel', () => {
    const imovel = Imovel.create('1', 'user-1', 'record-1', new Date());
    const returnedImovel = imovel.return();

    expect(returnedImovel.returnDate).toBeDefined();
  });

  it('should throw an error if returning an already returned imovel', () => {
    const imovel = Imovel.create('1', 'user-1', 'record-1', new Date());
    imovel.return();
    expect(() => imovel.return()).toThrow('Imovel already returned');
  });
});
