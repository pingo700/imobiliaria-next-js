describe('Formatters Utility', () => {
  describe('formatPrice', () => {
    it('should format price correctly', () => {
      const formatPrice = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(value);
      };

      expect(formatPrice(150000)).toBe('R$ 150.000,00');
      expect(formatPrice(1500)).toBe('R$ 1.500,00');
    });
  });

  describe('formatArea', () => {
    it('should format area correctly', () => {
      const formatArea = (value: number) => `${value} m²`;

      expect(formatArea(100)).toBe('100 m²');
      expect(formatArea(250.5)).toBe('250.5 m²');
    });
  });

  describe('formatPhone', () => {
    it('should format phone correctly', () => {
      const formatPhone = (value: string) => {
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length === 11) {
          return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        }
        return value;
      };

      expect(formatPhone('11999887766')).toBe('(11) 99988-7766');
    });
  });
});
