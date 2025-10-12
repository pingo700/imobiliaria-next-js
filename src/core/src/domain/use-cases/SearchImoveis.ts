import { Imovel, ImovelCategoria } from '../entities/Imovel';
import { IImovelRepository } from '../repositories/IImovelRepository';

export interface SearchImoveisParams {
  termo?: string; // Busca por nome ou código
  categoria?: ImovelCategoria;
  valorMin?: number;
  valorMax?: number;
  bairroId?: string;
  cep?: string;
  comCondominio?: boolean;
  raio?: number; // Raio em km para busca por localização
  latitude?: number;
  longitude?: number;
}

export class SearchImoveis {
  constructor(private readonly imovelRepository: IImovelRepository) {}

  async execute(params: SearchImoveisParams): Promise<Imovel[]> {
    const {
      termo,
      categoria,
      valorMin,
      valorMax,
      bairroId,
      cep,
      comCondominio,
      raio,
      latitude,
      longitude
    } = params;

    // Busca inicial com filtros básicos
    let imoveis = await this.imovelRepository.findAll({
      categoria,
      valorMin,
      valorMax,
      bairroId
    });

    // Filtro por termo de busca (nome ou código)
    if (termo) {
      const termoLower = termo.toLowerCase();
      imoveis = imoveis.filter(imovel => 
        imovel.nome.toLowerCase().includes(termoLower) ||
        (imovel.codigo && imovel.codigo.toLowerCase().includes(termoLower))
      );
    }

    // Filtro por CEP
    if (cep) {
      const cepNumerico = cep.replace(/\D/g, '');
      imoveis = imoveis.filter(imovel => imovel.cep === cepNumerico);
    }

    // Filtro por condomínio
    if (comCondominio !== undefined) {
      imoveis = imoveis.filter(imovel => 
        comCondominio ? imovel.condominio !== null : imovel.condominio === null
      );
    }

    // Filtro por proximidade geográfica
    if (raio && latitude !== undefined && longitude !== undefined) {
      imoveis = imoveis.filter(imovel => {
        if (imovel.latitude === null || imovel.longitude === null) {
          return false;
        }
        const distancia = this.calcularDistancia(
          latitude,
          longitude,
          imovel.latitude,
          imovel.longitude
        );
        return distancia <= raio;
      });
    }

    return imoveis;
  }

  /**
   * Calcula distância entre dois pontos usando a fórmula de Haversine
   * @returns Distância em quilômetros
   */
  private calcularDistancia(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Raio da Terra em km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
      Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degree: number): number {
    return (degree * Math.PI) / 180;
  }
}