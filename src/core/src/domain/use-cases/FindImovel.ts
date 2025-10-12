import { Imovel } from '../entities/Imovel';
import { IImovelRepository } from '../repositories/IImovelRepository';

export class FindImovel {
  constructor(private readonly imovelRepository: IImovelRepository) {}

  async execute(params: { id: string }): Promise<Imovel | null> {
    return this.imovelRepository.findById(params.id);
  }
}

export class FindImovelByCodigo {
  constructor(private readonly imovelRepository: IImovelRepository) {}

  async execute(params: { codigo: string }): Promise<Imovel | null> {
    return this.imovelRepository.findByCodigo(params.codigo);
  }
}

export class FindImovelBySlug {
  constructor(private readonly imovelRepository: IImovelRepository) {}

  async execute(params: { slug: string }): Promise<Imovel | null> {
    return this.imovelRepository.findBySlug(params.slug);
  }
}