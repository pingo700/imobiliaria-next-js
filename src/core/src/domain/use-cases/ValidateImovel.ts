import { ImovelCategoria } from '../entities/Imovel';

export interface ValidationError {
  campo: string;
  mensagem: string;
}

export interface ValidateImovelDataParams {
  codigo?: string;
  nome: string;
  categoria: ImovelCategoria;
  valor?: number;
  cep: string;
  endereco?: string;
  latitude?: number;
  longitude?: number;
}

export class ValidateImovelData {
  execute(params: ValidateImovelDataParams): ValidationError[] {
    const errors: ValidationError[] = [];

    // Validar código
    if (params.codigo && !this.isValidCodigo(params.codigo)) {
      errors.push({
        campo: 'codigo',
        mensagem: 'Código deve conter apenas letras e números'
      });
    }

    // Validar nome
    if (!params.nome || params.nome.trim().length === 0) {
      errors.push({
        campo: 'nome',
        mensagem: 'Nome é obrigatório'
      });
    } else if (params.nome.length < 3) {
      errors.push({
        campo: 'nome',
        mensagem: 'Nome deve ter pelo menos 3 caracteres'
      });
    } else if (params.nome.length > 100) {
      errors.push({
        campo: 'nome',
        mensagem: 'Nome deve ter no máximo 100 caracteres'
      });
    }

    // Validar categoria
    if (!Object.values(ImovelCategoria).includes(params.categoria)) {
      errors.push({
        campo: 'categoria',
        mensagem: 'Categoria inválida'
      });
    }

    // Validar valor
    if (params.valor !== undefined && params.valor !== null) {
      if (params.valor < 0) {
        errors.push({
          campo: 'valor',
          mensagem: 'Valor não pode ser negativo'
        });
      } else if (params.valor > 999999999999.99) {
        errors.push({
          campo: 'valor',
          mensagem: 'Valor excede o limite máximo'
        });
      }
    }

    // Validar CEP
    const cepNumerico = params.cep.replace(/\D/g, '');
    if (cepNumerico.length !== 8) {
      errors.push({
        campo: 'cep',
        mensagem: 'CEP deve ter 8 dígitos'
      });
    }

    // Validar endereço
    if (params.endereco && params.endereco.length > 255) {
      errors.push({
        campo: 'endereco',
        mensagem: 'Endereço deve ter no máximo 255 caracteres'
      });
    }

    // Validar coordenadas
    if (params.latitude !== undefined && params.latitude !== null) {
      if (params.latitude < -90 || params.latitude > 90) {
        errors.push({
          campo: 'latitude',
          mensagem: 'Latitude deve estar entre -90 e 90'
        });
      }
    }

    if (params.longitude !== undefined && params.longitude !== null) {
      if (params.longitude < -180 || params.longitude > 180) {
        errors.push({
          campo: 'longitude',
          mensagem: 'Longitude deve estar entre -180 e 180'
        });
      }
    }

    // Validar que se há latitude, também deve haver longitude e vice-versa
    const hasLatitude = params.latitude !== undefined && params.latitude !== null;
    const hasLongitude = params.longitude !== undefined && params.longitude !== null;
    
    if (hasLatitude !== hasLongitude) {
      errors.push({
        campo: 'coordenadas',
        mensagem: 'Latitude e longitude devem ser fornecidas juntas'
      });
    }

    return errors;
  }

  private isValidCodigo(codigo: string): boolean {
    return /^[A-Z0-9]+$/i.test(codigo);
  }
}

export class ValidateBusinessRules {
  execute(params: {
    categoria: ImovelCategoria;
    valor?: number;
    condominio?: string;
  }): ValidationError[] {
    const errors: ValidationError[] = [];
    const { categoria, valor, condominio } = params;

    // Regra: Terrenos geralmente não têm condomínio (aviso, não erro)
    if (categoria === ImovelCategoria.TERRENO && condominio) {
      // Este é apenas um aviso, não um erro bloqueante
      // Pode ser tratado diferentemente na aplicação
    }

    // Regra: Imóveis comerciais geralmente têm valores mais altos
    if (categoria === ImovelCategoria.COMERCIAL && valor && valor < 100000) {
      errors.push({
        campo: 'valor',
        mensagem: 'Valor pode estar abaixo do esperado para imóvel comercial'
      });
    }

    // Regra: Kitnets geralmente têm valores menores
    if (categoria === ImovelCategoria.KITNET && valor && valor > 500000) {
      errors.push({
        campo: 'valor',
        mensagem: 'Valor pode estar acima do esperado para kitnet'
      });
    }

    return errors;
  }
}