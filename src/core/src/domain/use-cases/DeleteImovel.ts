import { IImovelRepository } from '../repositories/IImovelRepository';

export class DeleteImovel {
  constructor(private readonly imovelRepository: IImovelRepository) {}

  async execute(params: { id: string }): Promise<void> {
    const { id } = params;

    const imovel = await this.imovelRepository.findById(id);

    if (!imovel) {
      throw new Error('Imóvel não encontrado');
    }

    if (imovel.isDeleted()) {
      throw new Error('Imóvel já está deletado');
    }

    // Soft delete
    const deletedImovel = imovel.softDelete();
    await this.imovelRepository.update(deletedImovel);
  }
}

export class HardDeleteImovel {
  constructor(private readonly imovelRepository: IImovelRepository) {}

  async execute(params: { id: string }): Promise<void> {
    const { id } = params;

    const imovel = await this.imovelRepository.findById(id);

    if (!imovel) {
      throw new Error('Imóvel não encontrado');
    }

    // Hard delete - remove permanentemente do banco
    await this.imovelRepository.delete(id);
  }
}