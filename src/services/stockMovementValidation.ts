
export interface ValidationError {
  type?: string;
  quantity?: string;
  notes?: string;
}

export const validateStockMovementForm = (
  type: 'in' | 'out' | '',
  quantity: number
): ValidationError => {
  const errors: ValidationError = {};

  if (!type) {
    errors.type = 'Selecione o tipo de movimentação';
  }

  // Validação mais rigorosa da quantidade
  if (!quantity || isNaN(quantity) || quantity <= 0 || !Number.isInteger(quantity)) {
    errors.quantity = 'Quantidade deve ser um número inteiro maior que 0';
  }

  return errors;
};

export const hasValidationErrors = (errors: ValidationError): boolean => {
  return Object.keys(errors).length > 0;
};
