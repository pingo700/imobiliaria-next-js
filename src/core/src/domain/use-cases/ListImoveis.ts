import { Imovel, ImovelCategoria } from '../entities/Imovel';
import { IImovelRepository, ImovelFilters } from '../repositories/IImovelRepository';

export class ListImoveis {
  constructor(private readonly imovelRepository: IImovelRepository) {}

  async execute(params?: ImovelFilters): Promise<Imovel[]> {
    return this.imovelRepository.findAll(params);
  }
}

export class ListImoveisByBairro {
  constructor(private readonly imovelRepository: IImovelRepository) {}

  async execute(params: { bairroId: string }): Promise<Imovel[]> {
    return this.imovelRepository.findByBairro(params.bairroId);
  }
}

export class ListImoveisByCategoria {
  constructor(private readonly imovelRepository: IImovelRepository) {}

  async execute(params: { categoria: ImovelCategoria }): Promise<Imovel[]> {
    return this.imovelRepository.findByCategoria(params.categoria);
  }
}