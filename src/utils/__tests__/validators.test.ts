import { describe, it, expect } from 'vitest';
import { validateEmail, validatePassword, validateRequired } from '@/utils/validators';

describe('validators', () => {
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
      expect(validatePassword('Password123!')).toBe(true);
      expect(validatePassword('MyStr0ng@Pass')).toBe(true);
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
      expect(validateRequired('123')).toBe(true);
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