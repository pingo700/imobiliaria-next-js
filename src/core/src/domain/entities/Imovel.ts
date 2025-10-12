export enum ImovelCategoria {
  CASA = 'Casa',
  APARTAMENTO = 'Apartamento',
  TERRENO = 'Terreno',
  COMERCIAL = 'Comercial',
  KITNET = 'Kitnet'
}

export class Imovel {
  private constructor(
    readonly id: string,
    readonly codigo: string | null,
    readonly nome: string,
    readonly slug: string,
    readonly categoria: ImovelCategoria,
    readonly valor: number | null,
    readonly cep: string,
    readonly endereco: string | null,
    readonly condominio: string | null,
    readonly latitude: number | null,
    readonly longitude: number | null,
    readonly bairroId: string,
    readonly usuarioCriadorId: string,
    readonly usuarioAtualizadorId: string,
    readonly createdAt: Date,
    readonly updatedAt: Date,
    readonly deletedAt: Date | null = null
  ) {}

  static create(
    id: string,
    codigo: string | null,
    nome: string,
    slug: string,
    categoria: ImovelCategoria,
    valor: number | null,
    cep: string,
    endereco: string | null,
    condominio: string | null,
    latitude: number | null,
    longitude: number | null,
    bairroId: string,
    usuarioCriadorId: string,
    usuarioAtualizadorId: string,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
    deletedAt: Date | null = null
  ): Imovel {
    if (!nome || nome.trim().length === 0) {
      throw new Error('Nome do imóvel é obrigatório');
    }

    if (!slug || slug.trim().length === 0) {
      throw new Error('Slug do imóvel é obrigatório');
    }

    if (!cep || cep.length !== 8) {
      throw new Error('CEP deve ter 8 dígitos');
    }

    if (valor !== null && valor < 0) {
      throw new Error('Valor do imóvel não pode ser negativo');
    }

    return new Imovel(
      id,
      codigo,
      nome,
      slug,
      categoria,
      valor,
      cep,
      endereco,
      condominio,
      latitude,
      longitude,
      bairroId,
      usuarioCriadorId,
      usuarioAtualizadorId,
      createdAt,
      updatedAt,
      deletedAt
    );
  }

  update(
    nome?: string,
    categoria?: ImovelCategoria,
    valor?: number | null,
    endereco?: string | null,
    condominio?: string | null,
    latitude?: number | null,
    longitude?: number | null,
    bairroId?: string,
    usuarioAtualizadorId?: string
  ): Imovel {
    return new Imovel(
      this.id,
      this.codigo,
      nome ?? this.nome,
      this.slug,
      categoria ?? this.categoria,
      valor !== undefined ? valor : this.valor,
      this.cep,
      endereco !== undefined ? endereco : this.endereco,
      condominio !== undefined ? condominio : this.condominio,
      latitude !== undefined ? latitude : this.latitude,
      longitude !== undefined ? longitude : this.longitude,
      bairroId ?? this.bairroId,
      this.usuarioCriadorId,
      usuarioAtualizadorId ?? this.usuarioAtualizadorId,
      this.createdAt,
      new Date(),
      this.deletedAt
    );
  }

  softDelete(): Imovel {
    if (this.deletedAt) {
      throw new Error('Imóvel já está deletado');
    }

    return new Imovel(
      this.id,
      this.codigo,
      this.nome,
      this.slug,
      this.categoria,
      this.valor,
      this.cep,
      this.endereco,
      this.condominio,
      this.latitude,
      this.longitude,
      this.bairroId,
      this.usuarioCriadorId,
      this.usuarioAtualizadorId,
      this.createdAt,
      this.updatedAt,
      new Date()
    );
  }

  isDeleted(): boolean {
    return this.deletedAt !== null;
  }
}