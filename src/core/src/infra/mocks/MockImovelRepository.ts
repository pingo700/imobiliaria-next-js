import { IImovelRepository, ImovelFilters } from '../../domain/repositories/IImovelRepository';
import { Imovel, ImovelCategoria } from '../../domain/entities/Imovel';

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

  async findByCodigo(codigo: string): Promise<Imovel | null> {
    return this.imoveis.find(imovel => imovel.codigo === codigo) || null;
  }

  async findBySlug(slug: string): Promise<Imovel | null> {
    return this.imoveis.find(imovel => imovel.slug === slug) || null;
  }

  async findAll(filters?: ImovelFilters): Promise<Imovel[]> {
    let result = [...this.imoveis];

    // Por padrão, não inclui deletados
    if (!filters?.incluirDeletados) {
      result = result.filter(imovel => !imovel.isDeleted());
    }

    if (filters?.categoria) {
      result = result.filter(imovel => imovel.categoria === filters.categoria);
    }

    if (filters?.bairroId) {
      result = result.filter(imovel => imovel.bairroId === filters.bairroId);
    }

    if (filters?.valorMin !== undefined) {
      result = result.filter(imovel => imovel.valor !== null && imovel.valor >= filters.valorMin!);
    }

    if (filters?.valorMax !== undefined) {
      result = result.filter(imovel => imovel.valor !== null && imovel.valor <= filters.valorMax!);
    }

    return result;
  }

  async findByBairro(bairroId: string): Promise<Imovel[]> {
    return this.imoveis.filter(
      imovel => imovel.bairroId === bairroId && !imovel.isDeleted()
    );
  }

  async findByCategoria(categoria: ImovelCategoria): Promise<Imovel[]> {
    return this.imoveis.filter(
      imovel => imovel.categoria === categoria && !imovel.isDeleted()
    );
  }

  async update(imovel: Imovel): Promise<void> {
    const imovelIndex = this.imoveis.findIndex(i => i.id === imovel.id);
    if (imovelIndex !== -1) {
      this.imoveis[imovelIndex] = imovel;
    }
  }

  async delete(id: string): Promise<void> {
    this.imoveis = this.imoveis.filter(imovel => imovel.id !== id);
  }

  public reset(): void {
    this.imoveis = [];
  }
}