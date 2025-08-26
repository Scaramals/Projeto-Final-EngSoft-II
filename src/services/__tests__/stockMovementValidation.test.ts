import { describe, it, expect } from 'vitest';
import { 
  validateStockMovementForm, 
  hasValidationErrors 
} from '@/services/stockMovementValidation';

describe('stockMovementValidation', () => {
  describe('validateStockMovementForm', () => {
    it('deve validar formulário correto', () => {
      const errors = validateStockMovementForm('in', 10);
      
      expect(errors).toEqual({});
    });

    it('deve rejeitar tipo vazio', () => {
      const errors = validateStockMovementForm('', 10);
      
      expect(errors.type).toBe('Selecione o tipo de movimentação');
    });

    it('deve rejeitar quantidade zero', () => {
      const errors = validateStockMovementForm('in', 0);
      
      expect(errors.quantity).toBe('Quantidade deve ser um número inteiro maior que 0');
    });

    it('deve rejeitar quantidade negativa', () => {
      const errors = validateStockMovementForm('in', -5);
      
      expect(errors.quantity).toBe('Quantidade deve ser um número inteiro maior que 0');
    });

    it('deve rejeitar quantidade decimal', () => {
      const errors = validateStockMovementForm('in', 10.5);
      
      expect(errors.quantity).toBe('Quantidade deve ser um número inteiro maior que 0');
    });

    it('deve rejeitar quantidade NaN', () => {
      const errors = validateStockMovementForm('in', NaN);
      
      expect(errors.quantity).toBe('Quantidade deve ser um número inteiro maior que 0');
    });

    it('deve validar tipo "out"', () => {
      const errors = validateStockMovementForm('out', 5);
      
      expect(errors).toEqual({});
    });

    it('deve validar múltiplos erros', () => {
      const errors = validateStockMovementForm('', 0);
      
      expect(errors.type).toBe('Selecione o tipo de movimentação');
      expect(errors.quantity).toBe('Quantidade deve ser um número inteiro maior que 0');
    });

    it('deve aceitar números inteiros grandes', () => {
      const errors = validateStockMovementForm('in', 1000000);
      
      expect(errors).toEqual({});
    });

    it('deve rejeitar quantidade undefined como NaN', () => {
      const errors = validateStockMovementForm('in', undefined as any);
      
      expect(errors.quantity).toBe('Quantidade deve ser um número inteiro maior que 0');
    });

    it('deve rejeitar quantidade null como NaN', () => {
      const errors = validateStockMovementForm('in', null as any);
      
      expect(errors.quantity).toBe('Quantidade deve ser um número inteiro maior que 0');
    });
  });

  describe('hasValidationErrors', () => {
    it('deve retornar false para objeto de erro vazio', () => {
      expect(hasValidationErrors({})).toBe(false);
    });

    it('deve retornar true para objeto com erros', () => {
      const errors = { type: 'Erro de tipo' };
      expect(hasValidationErrors(errors)).toBe(true);
    });

    it('deve retornar true para múltiplos erros', () => {
      const errors = { 
        type: 'Erro de tipo',
        quantity: 'Erro de quantidade'
      };
      expect(hasValidationErrors(errors)).toBe(true);
    });

    it('deve retornar false para propriedades undefined', () => {
      const errors = { 
        type: undefined,
        quantity: undefined
      };
      expect(hasValidationErrors(errors)).toBe(false);
    });

    it('deve retornar true para pelo menos um erro válido', () => {
      const errors = { 
        type: undefined,
        quantity: 'Erro de quantidade'
      };
      expect(hasValidationErrors(errors)).toBe(true);
    });
  });
});