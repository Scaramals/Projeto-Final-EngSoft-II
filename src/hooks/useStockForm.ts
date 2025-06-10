
import { useState, useCallback } from 'react';

export interface StockFormData {
  type: 'in' | 'out';
  quantity: number;
  notes: string;
  supplierId?: string;
}

export interface StockFormValidation {
  type?: string;
  quantity?: string;
  general?: string;
}

export const useStockForm = (initialData?: Partial<StockFormData>) => {
  const [formData, setFormData] = useState<StockFormData>({
    type: 'in',
    quantity: 0,
    notes: '',
    supplierId: '',
    ...initialData
  });

  const [errors, setErrors] = useState<StockFormValidation>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = useCallback((field: keyof StockFormData, value: any) => {
    setFormData(prev => {
      if (prev[field] === value) return prev;
      return { ...prev, [field]: value };
    });
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const validateForm = useCallback((currentStock: number): boolean => {
    const newErrors: StockFormValidation = {};

    if (!formData.type) {
      newErrors.type = 'Selecione o tipo de movimentação';
    }

    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = 'Quantidade deve ser maior que zero';
    } else if (!Number.isInteger(formData.quantity)) {
      newErrors.quantity = 'Quantidade deve ser um número inteiro';
    } else if (formData.type === 'out' && formData.quantity > currentStock) {
      newErrors.quantity = `Quantidade não pode ser maior que o estoque disponível (${currentStock})`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData({
      type: 'in',
      quantity: 0,
      notes: '',
      supplierId: ''
    });
    setErrors({});
    setIsSubmitting(false);
  }, []);

  return {
    formData,
    errors,
    isSubmitting,
    setIsSubmitting,
    updateField,
    validateForm,
    resetForm,
    setErrors
  };
};
