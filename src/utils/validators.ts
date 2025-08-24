import { z } from "zod";

// Validador para nome
export const nameSchema = z.string()
  .min(2, "Nome deve ter pelo menos 2 caracteres")
  .max(100, "Nome não pode exceder 100 caracteres")
  .regex(/^[A-Za-zÀ-ÿ0-9\s\-\.\_]+$/, "Nome contém caracteres inválidos");

// Validador para CPF
export const cpfSchema = z.string()
  .min(14, "CPF deve ter 11 dígitos")
  .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "Formato de CPF inválido")
  .refine((cpf) => {
    const digits = cpf.replace(/\D/g, '');
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(digits)) return false;
    
    // Validação do primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(digits[i]) * (10 - i);
    }
    let firstDigit = 11 - (sum % 11);
    if (firstDigit >= 10) firstDigit = 0;
    
    if (parseInt(digits[9]) !== firstDigit) return false;
    
    // Validação do segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(digits[i]) * (11 - i);
    }
    let secondDigit = 11 - (sum % 11);
    if (secondDigit >= 10) secondDigit = 0;
    
    return parseInt(digits[10]) === secondDigit;
  }, "CPF inválido");

// Validador para CNPJ
export const cnpjSchema = z.string()
  .min(18, "CNPJ deve ter 14 dígitos")
  .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, "Formato de CNPJ inválido")
  .refine((cnpj) => {
    const digits = cnpj.replace(/\D/g, '');
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{13}$/.test(digits)) return false;
    
    // Validação dos dígitos verificadores do CNPJ
    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(digits[i]) * weights1[i];
    }
    let firstDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    
    if (parseInt(digits[12]) !== firstDigit) return false;
    
    sum = 0;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(digits[i]) * weights2[i];
    }
    let secondDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    
    return parseInt(digits[13]) === secondDigit;
  }, "CNPJ inválido");

// Validador para telefone
export const phoneSchema = z.string()
  .min(14, "Telefone deve ter pelo menos 10 dígitos")
  .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, "Formato de telefone inválido");

// Validador para CEP
export const cepSchema = z.string()
  .min(9, "CEP deve ter 8 dígitos")
  .regex(/^\d{5}-\d{3}$/, "Formato de CEP inválido");

// Validador aprimorado para moeda
export const currencySchema = z.coerce.number()
  .min(0, "Valor não pode ser negativo")
  .max(999999.99, "Valor muito alto");

// Função de validação de email
export const validateEmail = (email: string): boolean => {
  if (!email || email.trim() === '') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Função de validação de senha
export const validatePassword = (password: string): boolean => {
  if (!password || password.length < 6) return false;
  // Deve conter pelo menos uma maiúscula, uma minúscula e um número
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  return hasUpperCase && hasLowerCase && hasNumbers;
};

// Função de validação de campo obrigatório
export const validateRequired = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return true;
};

// Validador para quantidade
export const quantitySchema = z.coerce.number()
  .int("Quantidade deve ser um número inteiro")
  .min(0, "Quantidade não pode ser negativa")
  .max(999999, "Quantidade muito alta");

// Validador para nome de produto
export const productNameSchema = z.string()
  .min(2, "Nome deve ter pelo menos 2 caracteres")
  .max(100, "Nome não pode exceder 100 caracteres")
  .regex(/^[A-Za-zÀ-ÿ0-9\s\-\.\_]+$/, "Nome contém caracteres inválidos");
