
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface AutoCurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
}

export const AutoCurrencyInput: React.FC<AutoCurrencyInputProps> = ({
  value,
  onChange,
  placeholder = "R$ 0,00",
  className,
  ...props
}) => {
  const [displayValue, setDisplayValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Formatação de moeda
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Conversão de string para número - mais robusta
  const parseCurrency = (str: string): number => {
    // Remove tudo exceto dígitos e vírgula/ponto
    const cleaned = str.replace(/[^\d,.-]/g, '');
    
    // Se está vazio, retorna 0
    if (!cleaned) return 0;
    
    // Se tem vírgula, substitui por ponto para parseFloat
    const normalized = cleaned.replace(',', '.');
    
    // Converte para número
    const parsed = parseFloat(normalized);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Formatação em tempo real durante a digitação
  const formatRealTime = (str: string): string => {
    const numericValue = parseCurrency(str);
    
    if (numericValue === 0 && str === '') {
      return '';
    }
    
    // Para valores pequenos, mostra como centavos
    if (numericValue < 1 && numericValue > 0) {
      return `R$ 0,${(numericValue * 100).toFixed(0).padStart(2, '0')}`;
    }
    
    // Para valores maiores, formata normalmente
    return formatCurrency(numericValue);
  };

  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(value > 0 ? formatCurrency(value) : '');
    }
  }, [value, isFocused]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    if (isFocused) {
      setDisplayValue(inputValue);
      
      // Converte e atualiza o valor
      const numericValue = parseCurrency(inputValue);
      onChange(numericValue);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    
    // Mostra valor editável (apenas números e vírgula)
    if (value > 0) {
      const editableValue = value.toFixed(2).replace('.', ',');
      setDisplayValue(editableValue);
    } else {
      setDisplayValue('');
    }
    
    // Seleciona todo o texto
    setTimeout(() => {
      e.target.select();
    }, 0);
    
    if (props.onFocus) props.onFocus(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    
    // Volta para o formato de exibição
    setDisplayValue(value > 0 ? formatCurrency(value) : '');
    
    if (props.onBlur) props.onBlur(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Permite números, vírgula, ponto, backspace, delete, tab, escape, enter
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'
    ];
    
    const isNumber = /^[0-9]$/.test(e.key);
    const isCommaOrDot = e.key === ',' || e.key === '.';
    
    if (!allowedKeys.includes(e.key) && !isNumber && !isCommaOrDot) {
      e.preventDefault();
    }
    
    if (props.onKeyDown) props.onKeyDown(e);
  };

  return (
    <Input
      {...props}
      type="text"
      value={displayValue}
      onChange={handleInputChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className={cn(className)}
    />
  );
};
