import { describe, it, expect } from '@jest/globals';
import { renderHook, act } from '@testing-library/react';
import { useStockForm } from '@/hooks/useStockForm';

describe('useStockForm', () => {
  it('deve inicializar com valores padrão', () => {
    const { result } = renderHook(() => useStockForm());

    expect(result.current.formData).toEqual({
      type: 'in',
      quantity: 0,
      notes: '',
      supplierId: '',
    });
    expect(result.current.errors).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
  });

  it('deve inicializar com dados personalizados', () => {
    const initialData = {
      type: 'out' as const,
      quantity: 10,
      notes: 'Teste',
      supplierId: 'supplier1',
    };

    const { result } = renderHook(() => useStockForm(initialData));

    expect(result.current.formData).toEqual(initialData);
  });

  it('deve atualizar campo corretamente', () => {
    const { result } = renderHook(() => useStockForm());

    act(() => {
      result.current.updateField('quantity', 25);
    });

    expect(result.current.formData.quantity).toBe(25);
  });

  it('deve limpar erro quando campo é atualizado', () => {
    const { result } = renderHook(() => useStockForm());

    // Primeiro, força um erro
    act(() => {
      result.current.setErrors({ quantity: 'Erro de quantidade' });
    });

    expect(result.current.errors.quantity).toBe('Erro de quantidade');

    // Depois atualiza o campo
    act(() => {
      result.current.updateField('quantity', 10);
    });

    expect(result.current.errors.quantity).toBeUndefined();
  });

  it('deve validar tipo obrigatório', () => {
    const { result } = renderHook(() => useStockForm());

    act(() => {
      result.current.updateField('type', '');
    });

    const isValid = result.current.validateForm(100);

    expect(isValid).toBe(false);
    expect(result.current.errors.type).toBe('Selecione o tipo de movimentação');
  });

  it('deve validar quantidade maior que zero', () => {
    const { result } = renderHook(() => useStockForm());

    act(() => {
      result.current.updateField('quantity', 0);
    });

    const isValid = result.current.validateForm(100);

    expect(isValid).toBe(false);
    expect(result.current.errors.quantity).toBe('Quantidade deve ser maior que zero');
  });

  it('deve validar quantidade como número inteiro', () => {
    const { result } = renderHook(() => useStockForm());

    act(() => {
      result.current.updateField('quantity', 10.5);
    });

    const isValid = result.current.validateForm(100);

    expect(isValid).toBe(false);
    expect(result.current.errors.quantity).toBe('Quantidade deve ser um número inteiro');
  });

  it('deve validar quantidade não maior que estoque para saída', () => {
    const { result } = renderHook(() => useStockForm());

    act(() => {
      result.current.updateField('type', 'out');
      result.current.updateField('quantity', 150);
    });

    const isValid = result.current.validateForm(100);

    expect(isValid).toBe(false);
    expect(result.current.errors.quantity).toBe('Quantidade não pode ser maior que o estoque disponível (100)');
  });

  it('deve permitir quantidade maior que estoque para entrada', () => {
    const { result } = renderHook(() => useStockForm());

    act(() => {
      result.current.updateField('type', 'in');
      result.current.updateField('quantity', 150);
    });

    const isValid = result.current.validateForm(100);

    expect(isValid).toBe(true);
    expect(result.current.errors.quantity).toBeUndefined();
  });

  it('deve validar formulário completo válido', () => {
    const { result } = renderHook(() => useStockForm());

    act(() => {
      result.current.updateField('type', 'in');
      result.current.updateField('quantity', 10);
      result.current.updateField('notes', 'Entrada de produtos');
    });

    const isValid = result.current.validateForm(100);

    expect(isValid).toBe(true);
    expect(Object.keys(result.current.errors)).toHaveLength(0);
  });

  it('deve resetar formulário', () => {
    const { result } = renderHook(() => useStockForm());

    // Primeiro, modifica dados
    act(() => {
      result.current.updateField('type', 'out');
      result.current.updateField('quantity', 50);
      result.current.updateField('notes', 'Teste');
      result.current.setIsSubmitting(true);
      result.current.setErrors({ type: 'Erro' });
    });

    expect(result.current.formData.type).toBe('out');
    expect(result.current.isSubmitting).toBe(true);

    // Depois reseta
    act(() => {
      result.current.resetForm();
    });

    expect(result.current.formData).toEqual({
      type: 'in',
      quantity: 0,
      notes: '',
      supplierId: '',
    });
    expect(result.current.errors).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
  });

  it('deve manter dados se valor não mudou', () => {
    const { result } = renderHook(() => useStockForm());

    const initialFormData = result.current.formData;

    act(() => {
      result.current.updateField('type', 'in'); // mesmo valor inicial
    });

    expect(result.current.formData).toBe(initialFormData); // referência deve ser a mesma
  });

  it('deve atualizar estado de submissão', () => {
    const { result } = renderHook(() => useStockForm());

    expect(result.current.isSubmitting).toBe(false);

    act(() => {
      result.current.setIsSubmitting(true);
    });

    expect(result.current.isSubmitting).toBe(true);
  });
});