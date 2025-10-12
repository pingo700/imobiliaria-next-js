import { ImovelCategoria } from '../entities/Imovel';
import { IImovelRepository } from '../repositories/IImovelRepository';

export interface ImovelStatisticsResult {
  total: number;
  porCategoria: Record<ImovelCategoria, number>;
  valorMedio: number;
  valorMinimo: number;
  valorMaximo: number;
  porBairro: Record<string, number>;
  comCondominio: number;
  semCondominio: number;
  comLocalizacao: number;
  semLocalizacao: number;
}

export class GetImovelStatistics {
  constructor(private readonly imovelRepository: IImovelRepository) {}

  async execute(): Promise<ImovelStatisticsResult> {
    const imoveis = await this.imovelRepository.findAll({ incluirDeletados: false });

    const porCategoria: Record<ImovelCategoria, number> = {
      [ImovelCategoria.CASA]: 0,
      [ImovelCategoria.APARTAMENTO]: 0,
      [ImovelCategoria.TERRENO]: 0,
      [ImovelCategoria.COMERCIAL]: 0,
      [ImovelCategoria.KITNET]: 0
    };

    const porBairro: Record<string, number> = {};
    let somaValores = 0;
    let countValores = 0;
    let valorMinimo = Infinity;
    let valorMaximo = -Infinity;
    let comCondominio = 0;
    let semCondominio = 0;
    let comLocalizacao = 0;
    let semLocalizacao = 0;

    for (const imovel of imoveis) {
      // Categoria
      porCategoria[imovel.categoria]++;

      // Bairro
      porBairro[imovel.bairroId] = (porBairro[imovel.bairroId] || 0) + 1;

      // Valores
      if (imovel.valor !== null) {
        somaValores += imovel.valor;
        countValores++;
        valorMinimo = Math.min(valorMinimo, imovel.valor);
        valorMaximo = Math.max(valorMaximo, imovel.valor);
      }

      // Condomínio
      if (imovel.condominio !== null) {
        comCondominio++;
      } else {
        semCondominio++;
      }

      // Localização
      if (imovel.latitude !== null && imovel.longitude !== null) {
        comLocalizacao++;
      } else {
        semLocalizacao++;
      }
    }

    return {
      total: imoveis.length,
      porCategoria,
      valorMedio: countValores > 0 ? somaValores / countValores : 0,
      valorMinimo: valorMinimo === Infinity ? 0 : valorMinimo,
      valorMaximo: valorMaximo === -Infinity ? 0 : valorMaximo,
      porBairro,
      comCondominio,
      semCondominio,
      comLocalizacao,
      semLocalizacao
    };
  }
}

export class GetBairroStatistics {
  constructor(private readonly imovelRepository: IImovelRepository) {}

  async execute(params: { bairroId: string }) {
    const imoveis = await this.imovelRepository.findByBairro(params.bairroId);

    const porCategoria: Record<ImovelCategoria, number> = {
      [ImovelCategoria.CASA]: 0,
      [ImovelCategoria.APARTAMENTO]: 0,
      [ImovelCategoria.TERRENO]: 0,
      [ImovelCategoria.COMERCIAL]: 0,
      [ImovelCategoria.KITNET]: 0
    };

    let somaValores = 0;
    let countValores = 0;

    for (const imovel of imoveis) {
      porCategoria[imovel.categoria]++;
      
      if (imovel.valor !== null) {
        somaValores += imovel.valor;
        countValores++;
      }
    }

    return {
      total: imoveis.length,
      porCategoria,
      valorMedio: countValores > 0 ? somaValores / countValores : 0
    };
  }
}