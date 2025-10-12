import { Imovel, ImovelCategoria } from '../entities/Imovel';
import { IImovelRepository, ImovelFilters } from '../repositories/IImovelRepository';

export type ExportFormat = 'json' | 'csv';

export interface ExportImoveisParams {
  format: ExportFormat;
  filters?: ImovelFilters;
  campos?: string[];
}

export class ExportImoveis {
  constructor(private readonly imovelRepository: IImovelRepository) {}

  async execute(params: ExportImoveisParams): Promise<string> {
    const { format, filters, campos } = params;

    const imoveis = await this.imovelRepository.findAll(filters);

    if (format === 'json') {
      return this.exportToJson(imoveis, campos);
    } else {
      return this.exportToCsv(imoveis, campos);
    }
  }

  private exportToJson(imoveis: Imovel[], campos?: string[]): string {
    const data = imoveis.map(imovel => this.mapImovelToObject(imovel, campos));
    return JSON.stringify(data, null, 2);
  }

  private exportToCsv(imoveis: Imovel[], campos?: string[]): string {
    if (imoveis.length === 0) {
      return '';
    }

    const allCampos = campos || this.getAllCampos();
    const headers = allCampos.join(',');
    
    const rows = imoveis.map(imovel => {
      const obj = this.mapImovelToObject(imovel, campos);
      return allCampos.map(campo => {
        const value = obj[campo];
        if (value === null || value === undefined) {
          return '';
        }
        // Escapa valores com vírgulas ou aspas
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',');
    });

    return [headers, ...rows].join('\n');
  }

  private mapImovelToObject(imovel: Imovel, campos?: string[]): Record<string, any> {
    const obj: Record<string, any> = {
      id: imovel.id,
      codigo: imovel.codigo,
      nome: imovel.nome,
      slug: imovel.slug,
      categoria: imovel.categoria,
      valor: imovel.valor,
      cep: imovel.cep,
      endereco: imovel.endereco,
      condominio: imovel.condominio,
      latitude: imovel.latitude,
      longitude: imovel.longitude,
      bairroId: imovel.bairroId,
      usuarioCriadorId: imovel.usuarioCriadorId,
      usuarioAtualizadorId: imovel.usuarioAtualizadorId,
      createdAt: imovel.createdAt.toISOString(),
      updatedAt: imovel.updatedAt.toISOString(),
      deletedAt: imovel.deletedAt?.toISOString() || null
    };

    if (campos && campos.length > 0) {
      const filtered: Record<string, any> = {};
      for (const campo of campos) {
        if (campo in obj) {
          filtered[campo] = obj[campo];
        }
      }
      return filtered;
    }

    return obj;
  }

  private getAllCampos(): string[] {
    return [
      'id',
      'codigo',
      'nome',
      'slug',
      'categoria',
      'valor',
      'cep',
      'endereco',
      'condominio',
      'latitude',
      'longitude',
      'bairroId',
      'usuarioCriadorId',
      'usuarioAtualizadorId',
      'createdAt',
      'updatedAt',
      'deletedAt'
    ];
  }
}

export class ImportImoveis {
  constructor(private readonly imovelRepository: IImovelRepository) {}

  async execute(params: {
    data: string;
    format: ExportFormat;
    usuarioImportadorId: string;
  }): Promise<{ sucesso: number; erros: Array<{ linha: number; erro: string }> }> {
    const { data, format, usuarioImportadorId } = params;

    let imoveisData: any[];

    if (format === 'json') {
      imoveisData = JSON.parse(data);
    } else {
      imoveisData = this.parseCsv(data);
    }

    let sucesso = 0;
    const erros: Array<{ linha: number; erro: string }> = [];

    for (let i = 0; i < imoveisData.length; i++) {
      try {
        const imovelData = imoveisData[i];
        
        const imovel = Imovel.create(
          this.generateId(),
          imovelData.codigo || null,
          imovelData.nome,
          imovelData.slug,
          imovelData.categoria as ImovelCategoria,
          imovelData.valor || null,
          imovelData.cep,
          imovelData.endereco || null,
          imovelData.condominio || null,
          imovelData.latitude || null,
          imovelData.longitude || null,
          imovelData.bairroId,
          usuarioImportadorId,
          usuarioImportadorId
        );

        await this.imovelRepository.save(imovel);
        sucesso++;
      } catch (error) {
        erros.push({
          linha: i + 1,
          erro: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }
    }

    return { sucesso, erros };
  }

  private parseCsv(csv: string): any[] {
    const lines = csv.split('\n');
    if (lines.length < 2) {
      return [];
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const result: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = this.parseCsvLine(line);
      const obj: any = {};

      headers.forEach((header, index) => {
        obj[header] = values[index] || null;
      });

      result.push(obj);
    }

    return result;
  }

  private parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}