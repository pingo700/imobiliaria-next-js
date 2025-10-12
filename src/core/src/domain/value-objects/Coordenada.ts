export class Coordenada {
  private constructor(
    readonly latitude: number,
    readonly longitude: number
  ) {}

  static create(latitude: number, longitude: number): Coordenada {
    if (!this.validateLatitude(latitude)) {
      throw new Error('Latitude inválida. Deve estar entre -90 e 90');
    }

    if (!this.validateLongitude(longitude)) {
      throw new Error('Longitude inválida. Deve estar entre -180 e 180');
    }

    return new Coordenada(latitude, longitude);
  }

  private static validateLatitude(lat: number): boolean {
    return lat >= -90 && lat <= 90;
  }

  private static validateLongitude(lon: number): boolean {
    return lon >= -180 && lon <= 180;
  }

  /**
   * Calcula a distância até outra coordenada usando a fórmula de Haversine
   * @returns Distância em quilômetros
   */
  distanciaAte(outra: Coordenada): number {
    const R = 6371; // Raio da Terra em km
    const dLat = this.toRad(outra.latitude - this.latitude);
    const dLon = this.toRad(outra.longitude - this.longitude);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(this.latitude)) *
      Math.cos(this.toRad(outra.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degree: number): number {
    return (degree * Math.PI) / 180;
  }

  /**
   * Retorna string formatada das coordenadas
   */
  toString(): string {
    return `${this.latitude}, ${this.longitude}`;
  }

  /**
   * Verifica se está dentro de um raio de outra coordenada
   */
  dentroDoRaio(outra: Coordenada, raioKm: number): boolean {
    return this.distanciaAte(outra) <= raioKm;
  }
}