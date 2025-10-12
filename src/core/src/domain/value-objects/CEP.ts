export class CEP {
  private constructor(readonly value: string) {}

  static create(cep: string): CEP {
    const cepNumerico = cep.replace(/\D/g, '');
    
    if (!this.validate(cepNumerico)) {
      throw new Error('CEP inválido. Deve conter 8 dígitos numéricos');
    }
    
    return new CEP(cepNumerico);
  }

  private static validate(cep: string): boolean {
    return /^\d{8}$/.test(cep);
  }

  /**
   * Retorna o CEP formatado (00000-000)
   */
  formatted(): string {
    return `${this.value.substring(0, 5)}-${this.value.substring(5)}`;
  }

  /**
   * Retorna apenas os números do CEP
   */
  numeric(): string {
    return this.value;
  }
}