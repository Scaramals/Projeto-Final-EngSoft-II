import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate } from '@/utils/formatters';

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('deve formatar valor como moeda brasileira', () => {
      expect(formatCurrency(1234.56)).toBe('R$ 1.234,56');
    });

    it('deve formatar zero corretamente', () => {
      expect(formatCurrency(0)).toBe('R$ 0,00');
    });

    it('deve formatar valores negativos', () => {
      expect(formatCurrency(-500)).toBe('-R$ 500,00');
    });

    it('deve tratar valores undefined', () => {
      expect(formatCurrency(undefined)).toBe('R$ 0,00');
    });

    it('deve tratar valores null', () => {
      expect(formatCurrency(null)).toBe('R$ 0,00');
    });
  });

  describe('formatDate', () => {
    it('deve formatar data brasileira', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      expect(formatDate(date)).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it('deve formatar string de data', () => {
      expect(formatDate('2024-01-15')).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it('deve retornar string vazia para data inválida', () => {
      expect(formatDate('')).toBe('');
      expect(formatDate(null)).toBe('');
    });
  });
});