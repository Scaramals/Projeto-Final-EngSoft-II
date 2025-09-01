import { describe, it, expect } from 'vitest';
import { 
  cn, 
  formatCurrency, 
  formatDate, 
  truncateText, 
  getStockStatus,
  formatPercentage,
  calculatePercentage,
  formatPhoneNumber
} from '@/lib/utils';

describe('utils', () => {
  describe('cn', () => {
    it('deve combinar classes corretamente', () => {
      const result = cn('class1', 'class2');
      expect(result).toContain('class1');
      expect(result).toContain('class2');
    });

    it('deve tratar classes condicionais', () => {
      const result = cn('base', { 'conditional': true, 'ignored': false });
      expect(result).toContain('base');
      expect(result).toContain('conditional');
      expect(result).not.toContain('ignored');
    });
  });

  describe('formatCurrency', () => {
    it('deve formatar moeda brasileira', () => {
      expect(formatCurrency(1234.56)).toMatch(/R\$\s*1\.234,56/);
    });

    it('deve formatar zero', () => {
      expect(formatCurrency(0)).toMatch(/R\$\s*0,00/);
    });

    it('deve formatar valores negativos', () => {
      expect(formatCurrency(-500)).toMatch(/-R\$\s*500,00/);
    });
  });

  describe('formatDate', () => {
    it('deve formatar data brasileira', () => {
      const dateString = '2024-01-15T10:30:00Z';
      const result = formatDate(dateString);
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
      expect(result).toMatch(/\d{2}:\d{2}/);
    });

    it('deve tratar data ISO', () => {
      const result = formatDate('2024-12-25T15:45:30.123Z');
      expect(result).toMatch(/25\/12\/2024/);
    });
  });

  describe('truncateText', () => {
    it('deve truncar texto longo', () => {
      const longText = 'Este é um texto muito longo que precisa ser truncado';
      const result = truncateText(longText, 20);
      expect(result).toBe('Este é um texto muit...');
      expect(result.length).toBe(23); // 20 + '...'
    });

    it('deve retornar texto curto inalterado', () => {
      const shortText = 'Texto curto';
      const result = truncateText(shortText, 20);
      expect(result).toBe(shortText);
    });

    it('deve tratar texto vazio', () => {
      expect(truncateText('', 10)).toBe('');
      expect(truncateText(null as any, 10)).toBe('');
      expect(truncateText(undefined as any, 10)).toBe('');
    });

    it('deve truncar no comprimento exato', () => {
      const text = 'Exatamente vinte caracteres';
      const result = truncateText(text, text.length);
      expect(result).toBe(text);
    });
  });

  describe('getStockStatus', () => {
    it('deve retornar "Sem estoque" para quantidade zero', () => {
      const status = getStockStatus(0);
      expect(status.label).toBe('Sem estoque');
      expect(status.class).toBe('status-low');
    });

    it('deve retornar "Crítico" para estoque muito baixo', () => {
      const status = getStockStatus(3, 10); // 3 <= 10/2
      expect(status.label).toBe('Crítico');
      expect(status.class).toBe('status-low');
    });

    it('deve retornar "Baixo" para estoque baixo', () => {
      const status = getStockStatus(8, 10); // 8 <= 10
      expect(status.label).toBe('Baixo');
      expect(status.class).toBe('status-medium');
    });

    it('deve retornar "Adequado" para estoque suficiente', () => {
      const status = getStockStatus(15, 10); // 15 > 10
      expect(status.label).toBe('Adequado');
      expect(status.class).toBe('status-good');
    });

    it('deve usar valor padrão de minimumStock', () => {
      const status = getStockStatus(5); // usando padrão de 10
      expect(status.label).toBe('Crítico'); // 5 <= 10/2
    });
  });

  describe('formatPercentage', () => {
    it('deve formatar porcentagem com 2 decimais padrão', () => {
      expect(formatPercentage(25.456)).toBe('25.46%');
    });

    it('deve formatar com decimais personalizados', () => {
      expect(formatPercentage(25.456, 1)).toBe('25.5%');
    });

    it('deve formatar zero', () => {
      expect(formatPercentage(0)).toBe('0.00%');
    });

    it('deve formatar números grandes', () => {
      expect(formatPercentage(123.789, 0)).toBe('124%');
    });
  });

  describe('calculatePercentage', () => {
    it('deve calcular porcentagem corretamente', () => {
      expect(calculatePercentage(25, 100)).toBe(25);
    });

    it('deve calcular porcentagem com decimais', () => {
      expect(calculatePercentage(1, 3)).toBeCloseTo(33.33, 2);
    });

    it('deve retornar 0 para total zero', () => {
      expect(calculatePercentage(10, 0)).toBe(0);
    });

    it('deve calcular porcentagem para valor zero', () => {
      expect(calculatePercentage(0, 100)).toBe(0);
    });
  });

  describe('formatPhoneNumber', () => {
    it('deve formatar telefone com 11 dígitos', () => {
      expect(formatPhoneNumber('11999887766')).toBe('(11) 99988-7766');
    });

    it('deve formatar telefone com 10 dígitos', () => {
      expect(formatPhoneNumber('1133445566')).toBe('(11) 3344-5566');
    });

    it('deve remover caracteres não numéricos', () => {
      expect(formatPhoneNumber('(11) 99988-7766')).toBe('(11) 99988-7766');
      expect(formatPhoneNumber('11.99988.7766')).toBe('(11) 99988-7766');
    });

    it('deve retornar original para formato inválido', () => {
      expect(formatPhoneNumber('123')).toBe('123');
      expect(formatPhoneNumber('123456789012')).toBe('123456789012');
    });

    it('deve tratar string vazia', () => {
      expect(formatPhoneNumber('')).toBe('');
      expect(formatPhoneNumber(null as any)).toBe('');
      expect(formatPhoneNumber(undefined as any)).toBe('');
    });

    it('deve manter formatação existente se já formatado', () => {
      const formatted = '(11) 99988-7766';
      expect(formatPhoneNumber(formatted)).toBe(formatted);
    });
  });
});