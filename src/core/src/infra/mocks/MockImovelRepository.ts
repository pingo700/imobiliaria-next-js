import { IImovelRepository } from '../../domain/repositories/IImovelRepository';
import { Imovel } from '../../domain/entities/Imovel';

export class MockImovelRepository implements IImovelRepository {
  private static instance: MockImovelRepository;
  private imoveis: Imovel[] = [];

  private constructor() {}

  public static getInstance(): MockImovelRepository {
    if (!MockImovelRepository.instance) {
      MockImovelRepository.instance = new MockImovelRepository();
    }
    return MockImovelRepository.instance;
  }

  async save(imovel: Imovel): Promise<void> {
    this.imoveis.push(imovel);
  }

  async findById(id: string): Promise<Imovel | null> {
    return this.imoveis.find(imovel => imovel.id === id) || null;
  }

  async findByUserId(userId: string): Promise<Imovel[]> {
    return this.imoveis.filter(imovel => imovel.userId === userId);
  }

  async findCurrentLoanOfRecord(vinylRecordId: string): Promise<Imovel | null> {
    return this.imoveis.find(imovel => imovel.vinylRecordId === vinylRecordId && !imovel.returnDate) || null;
  }

  async update(imovel: Imovel): Promise<void> {
    const imovelIndex = this.imoveis.findIndex(i => i.id === imovel.id);
    if (imovelIndex !== -1) {
      this.imoveis[imovelIndex] = imovel;
    }
  }

  public reset(): void {
    this.imoveis = [];
  }
}
