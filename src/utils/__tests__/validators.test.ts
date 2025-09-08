import { describe, it, expect } from '@jest/globals';
import {
  nameSchema,
  cpfSchema,
  cnpjSchema,
  phoneSchema,
  cepSchema,
  currencySchema,
  validateEmail,
  validatePassword,
  validateRequired,
  quantitySchema,
  productNameSchema,
} from '../validators';

describe('Validators', () => {

  // Testes para nameSchema
  describe('nameSchema', () => {
    it('should validate a correct name', () => {
      expect(nameSchema.safeParse('Produto Teste 1').success).toBe(true);
    });

    it('should invalidate a name that is too short', () => {
      const result = nameSchema.safeParse('A');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Nome deve ter pelo menos 2 caracteres');
      }
    });

    it('should invalidate a name with invalid characters', () => {
      const result = nameSchema.safeParse('Nome com @');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Nome contém caracteres inválidos');
      }
    });
  });

  // Testes para cpfSchema
  describe('cpfSchema', () => {
    it('should validate a correctly formatted and valid CPF', () => {
      // CPF válido gerado para testes
      expect(cpfSchema.safeParse('123.456.789-09').success).toBe(true);
    });

    it('should invalidate an incorrectly formatted CPF', () => {
      const result = cpfSchema.safeParse('12345678909');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Formato de CPF inválido');
      }
    });

    it('should invalidate a CPF with all same digits', () => {
      const result = cpfSchema.safeParse('111.111.111-11');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('CPF inválido');
      }
    });
  });

  // Testes para cnpjSchema
  describe('cnpjSchema', () => {
    it('should validate a correctly formatted and valid CNPJ', () => {
      // CNPJ válido gerado para testes
      expect(cnpjSchema.safeParse('33.938.446/0001-83').success).toBe(true);
    });

    it('should invalidate an incorrectly formatted CNPJ', () => {
      const result = cnpjSchema.safeParse('33938446000183');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Formato de CNPJ inválido');
      }
    });

    it('should invalidate a CNPJ with invalid verifier digits', () => {
      const result = cnpjSchema.safeParse('11.111.111/1111-11');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('CNPJ inválido');
      }
    });
  });

  // Testes para phoneSchema
  describe('phoneSchema', () => {
    it('should validate a correctly formatted phone number with 9 digits', () => {
      expect(phoneSchema.safeParse('(11) 98765-4321').success).toBe(true);
    });
    it('should validate a correctly formatted phone number with 8 digits', () => {
      expect(phoneSchema.safeParse('(11) 8765-4321').success).toBe(true);
    });
    it('should invalidate an incorrectly formatted phone number', () => {
      expect(phoneSchema.safeParse('11987654321').success).toBe(false);
    });
  });

  // Testes para cepSchema
  describe('cepSchema', () => {
    it('should validate a correctly formatted CEP', () => {
      expect(cepSchema.safeParse('12345-678').success).toBe(true);
    });
    it('should invalidate an incorrectly formatted CEP', () => {
      expect(cepSchema.safeParse('12345678').success).toBe(false);
    });
  });

  // Testes para currencySchema
  describe('currencySchema', () => {
    it('should validate a valid number', () => {
      expect(currencySchema.safeParse(19.99).success).toBe(true);
    });
    it('should invalidate a negative number', () => {
      const result = currencySchema.safeParse(-10);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Valor não pode ser negativo');
      }
    });
    it('should coerce a string number to a valid number', () => {
      expect(currencySchema.safeParse("123.45").success).toBe(true);
    });
  });

  // Testes para quantitySchema
  describe('quantitySchema', () => {
    it('should validate an integer', () => {
      expect(quantitySchema.safeParse(100).success).toBe(true);
    });
    it('should invalidate a float number', () => {
      const result = quantitySchema.safeParse(10.5);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Quantidade deve ser um número inteiro');
      }
    });
    it('should invalidate a negative number', () => {
      const result = quantitySchema.safeParse(-1);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Quantidade não pode ser negativa');
      }
    });
  });

  // Testes para productNameSchema (similar ao nameSchema)
  describe('productNameSchema', () => {
    it('should validate a correct product name', () => {
      expect(productNameSchema.safeParse('Parafuso Sextavado 1/4').success).toBe(true);
    });
    it('should invalidate a product name that is too short', () => {
      expect(productNameSchema.safeParse('A').success).toBe(false);
    });
  });

  // Funções de Validação Padrão
  describe('validateEmail', () => {
    it('deve validar email válido', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true);
    });

    it('deve rejeitar email inválido', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('deve validar senha forte', () => {
      expect(validatePassword('Password123')).toBe(true);
      expect(validatePassword('MyStr0ngPass')).toBe(true);
    });

    it('deve rejeitar senha fraca', () => {
      expect(validatePassword('123')).toBe(false); // muito curta
      expect(validatePassword('password')).toBe(false); // sem maiúscula/número
      expect(validatePassword('PASSWORD')).toBe(false); // sem minúscula
      expect(validatePassword('')).toBe(false);
    });
  });

  describe('validateRequired', () => {
    it('deve validar campo obrigatório preenchido', () => {
      expect(validateRequired('valor')).toBe(true);
      expect(validateRequired(123)).toBe(true);
      expect(validateRequired(0)).toBe(true);
      expect(validateRequired(' texto ')).toBe(true);
    });

    it('deve rejeitar campo obrigatório vazio', () => {
      expect(validateRequired('')).toBe(false);
      expect(validateRequired('   ')).toBe(false);
      expect(validateRequired(null)).toBe(false);
      expect(validateRequired(undefined)).toBe(false);
    });
  });
});

