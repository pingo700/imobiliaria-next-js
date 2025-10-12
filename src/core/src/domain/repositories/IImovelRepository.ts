import { Imovel, ImovelCategoria } from '../entities/Imovel';

export interface ImovelFilters {
  categoria?: ImovelCategoria;
  valorMin?: number;
  valorMax?: number;
  bairroId?: string;
  incluirDeletados?: boolean;
}

export interface IImovelRepository {
  save(imovel: Imovel): Promise<void>;
  findById(id: string): Promise<Imovel | null>;
  findByCodigo(codigo: string): Promise<Imovel | null>;
  findBySlug(slug: string): Promise<Imovel | null>;
  findAll(filters?: ImovelFilters): Promise<Imovel[]>;
  findByBairro(bairroId: string): Promise<Imovel[]>;
  findByCategoria(categoria: ImovelCategoria): Promise<Imovel[]>;
  update(imovel: Imovel): Promise<void>;
  delete(id: string): Promise<void>;
}