import { describe, it, expect } from '@jest/globals';
import {
  formatCurrency,
  parseCurrency,
  formatDate,
  formatDateTime,
  formatPercentage,
} from '@/utils/formatters';

describe('Formatters', () => {
  // Testes para formatCurrency
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

    it('deve formatar um número grande', () => {
      expect(formatCurrency(1000000)).toBe('R$ 1.000.000,00');
    });

    it('deve tratar strings numéricas', () => {
      expect(formatCurrency('55.5')).toBe('R$ 55,50');
    });

    it('deve tratar valores undefined como R$ 0,00', () => {
      expect(formatCurrency(undefined)).toBe('R$ 0,00');
    });

    it('deve tratar valores null como R$ 0,00', () => {
      expect(formatCurrency(null)).toBe('R$ 0,00');
    });

    it('deve retornar R$ 0,00 para NaN', () => {
      expect(formatCurrency(NaN)).toBe('R$ 0,00');
    });
  });

  // Testes para parseCurrency
  describe('parseCurrency', () => {
    it('deve converter uma string de moeda formatada em número', () => {
      expect(parseCurrency('R$ 1.234,56')).toBe(1234.56);
    });

    it('deve converter uma string com apenas vírgula', () => {
      expect(parseCurrency('19,99')).toBe(19.99);
    });

    it('deve converter um número negativo', () => {
      expect(parseCurrency('-R$ 500,00')).toBe(-500);
    });

    it('deve retornar 0 para uma string vazia ou inválida', () => {
      expect(parseCurrency('')).toBe(0);
      expect(parseCurrency('abc')).toBe(0);
    });
  });

  // Testes para formatDate
  describe('formatDate', () => {
    it('deve formatar um objeto Date para o formato brasileiro (DD/MM/YYYY)', () => {
      const date = new Date('2024-01-15T12:00:00Z');
      expect(formatDate(date)).toBe('15/01/2024');
    });

    it('deve formatar uma string de data (YYYY-MM-DD)', () => {
      expect(formatDate('2024-03-25')).toBe('25/03/2024');
    });

    it('deve retornar string vazia para data inválida', () => {
      expect(formatDate('data invalida')).toBe('');
    });

    it('deve retornar string vazia para valores nulos ou vazios', () => {
      expect(formatDate('')).toBe('');
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
    });
  });

  // Testes para formatDateTime
  describe('formatDateTime', () => {
    it('deve formatar uma data e hora para o formato brasileiro', () => {
      const date = new Date('2024-07-25T18:30:00Z');
      // O resultado pode variar com o fuso horário, então testamos o formato
      expect(formatDateTime(date)).toMatch(/\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}/);
    });

    it('deve retornar string vazia para data inválida', () => {
      expect(formatDateTime('not a date')).toBe('');
    });

    it('deve retornar string vazia para valores nulos ou vazios', () => {
      expect(formatDateTime(null)).toBe('');
      expect(formatDateTime(undefined)).toBe('');
    });
  });

  // Testes para formatPercentage
  describe('formatPercentage', () => {
    it('deve formatar um número como porcentagem com 2 casas decimais por padrão', () => {
      expect(formatPercentage(85.5)).toBe('85.50%');
    });

    it('deve formatar um número como porcentagem com um número customizado de casas decimais', () => {
      expect(formatPercentage(99.123, 0)).toBe('99%');
      expect(formatPercentage(99.123, 3)).toBe('99.123%');
    });

    it('deve formatar o número 0 corretamente', () => {
      expect(formatPercentage(0)).toBe('0.00%');
    });
  });
});

