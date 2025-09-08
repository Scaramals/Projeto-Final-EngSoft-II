// src/hooks/useStockForm.ts

import { useState, useCallback } from 'react';

// As interfaces permanecem as mesmas
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
    ...initialData,
  });

  const [errors, setErrors] = useState<StockFormValidation>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ DICA BÔNUS: Usando Generics para garantir que `value` tenha o tipo correto
  const updateField = useCallback(<K extends keyof StockFormData>(field: K, value: StockFormData[K]) => {
    setFormData(prev => {
      // Pequena otimização para evitar re-renderizações desnecessárias
      if (prev[field] === value) return prev;
      return { ...prev, [field]: value };
    });

    // ✅ CORREÇÃO: Verificamos se o campo existe no objeto de erros antes de limpá-lo
    if (field in errors) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]); // A dependência `errors` está correta aqui

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
      supplierId: '',
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
    setErrors,
  };
};