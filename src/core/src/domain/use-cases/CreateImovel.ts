import { Imovel, ImovelCategoria } from '../entities/Imovel';
import { IImovelRepository } from '../repositories/IImovelRepository';

export interface CreateImovelParams {
  codigo?: string;
  nome: string;
  categoria: ImovelCategoria;
  valor?: number;
  cep: string;
  endereco?: string;
  condominio?: string;
  latitude?: number;
  longitude?: number;
  bairroId: string;
  usuarioCriadorId: string;
}

export class CreateImovel {
  constructor(private readonly imovelRepository: IImovelRepository) {}

  async execute(params: CreateImovelParams): Promise<Imovel> {
    const {
      codigo,
      nome,
      categoria,
      valor,
      cep,
      endereco,
      condominio,
      latitude,
      longitude,
      bairroId,
      usuarioCriadorId
    } = params;

    // Verifica se já existe um imóvel com o mesmo código
    if (codigo) {
      const existingByCodigo = await this.imovelRepository.findByCodigo(codigo);
      if (existingByCodigo) {
        throw new Error('Já existe um imóvel com este código');
      }
    }

    // Gera slug a partir do nome
    const slug = this.generateSlug(nome);

    // Verifica se já existe um imóvel com o mesmo slug
    const existingBySlug = await this.imovelRepository.findBySlug(slug);
    if (existingBySlug) {
      throw new Error('Já existe um imóvel com este nome');
    }

    // Cria o imóvel
    const imovel = Imovel.create(
      this.generateId(),
      codigo || null,
      nome,
      slug,
      categoria,
      valor || null,
      cep.replace(/\D/g, ''), // Remove formatação do CEP
      endereco || null,
      condominio || null,
      latitude || null,
      longitude || null,
      bairroId,
      usuarioCriadorId,
      usuarioCriadorId
    );

    await this.imovelRepository.save(imovel);

    return imovel;
  }

  private generateSlug(nome: string): string {
    return nome
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}