import { Imovel, ImovelCategoria } from '../entities/Imovel';
import { IImovelRepository } from '../repositories/IImovelRepository';

export interface UpdateImovelParams {
  id: string;
  nome?: string;
  categoria?: ImovelCategoria;
  valor?: number | null;
  endereco?: string | null;
  condominio?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  bairroId?: string;
  usuarioAtualizadorId: string;
}

export class UpdateImovel {
  constructor(private readonly imovelRepository: IImovelRepository) {}

  async execute(params: UpdateImovelParams): Promise<Imovel> {
    const { id, usuarioAtualizadorId, ...updateData } = params;

    const imovel = await this.imovelRepository.findById(id);

    if (!imovel) {
      throw new Error('Imóvel não encontrado');
    }

    if (imovel.isDeleted()) {
      throw new Error('Não é possível atualizar um imóvel deletado');
    }

    const updatedImovel = imovel.update(
      updateData.nome,
      updateData.categoria,
      updateData.valor,
      updateData.endereco,
      updateData.condominio,
      updateData.latitude,
      updateData.longitude,
      updateData.bairroId,
      usuarioAtualizadorId
    );

    await this.imovelRepository.update(updatedImovel);

    return updatedImovel;
  }
}