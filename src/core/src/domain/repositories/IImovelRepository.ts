import { Imovel } from '../entities/Imovel';

export interface IImovelRepository {
  save(loan: Imovel): Promise<void>;
  findById(id: string): Promise<Imovel | null>;
  findByUserId(userId: string): Promise<Imovel[]>;
  findCurrentLoanOfRecord(vinylRecordId: string): Promise<Imovel | null>;
  update(loan: Imovel): Promise<void>;
}
