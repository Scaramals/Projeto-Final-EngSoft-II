
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
    // Remove tudo exceto dígitos
    const cleaned = str.replace(/[^\d]/g, '');
    
    // Se está vazio, retorna 0
    if (!cleaned) return 0;
    
    // Converte centavos para reais
    const value = parseInt(cleaned, 10) / 100;
    return isNaN(value) ? 0 : value;
  };

  // Formatação em tempo real durante a digitação
  const formatRealTime = (str: string): string => {
    // Remove tudo exceto números
    const cleaned = str.replace(/[^\d]/g, '');
    
    if (!cleaned) {
      return '';
    }
    
    // Converte para centavos
    const cents = parseInt(cleaned, 10);
    const reais = cents / 100;
    
    // Formata como moeda
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(reais);
  };

  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(value > 0 ? formatCurrency(value) : '');
    }
  }, [value, isFocused]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    if (isFocused) {
      // Formata em tempo real
      const formatted = formatRealTime(inputValue);
      setDisplayValue(formatted);
      
      // Converte e atualiza o valor
      const numericValue = parseCurrency(inputValue);
      onChange(numericValue);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    
    // Mostra valor formatado ou vazio
    if (value > 0) {
      setDisplayValue(formatCurrency(value));
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
    // Permite apenas números e teclas de controle
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'
    ];
    
    const isNumber = /^[0-9]$/.test(e.key);
    
    if (!allowedKeys.includes(e.key) && !isNumber) {
      e.preventDefault();
    }
    
    if (props.onKeyDown) props.onKeyDown(e);
  };

  return (
    <Input
      {...props}
      type="text"
      inputMode="numeric"
      value={displayValue}
      onChange={handleInputChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className={cn("text-base sm:text-sm", className)}
    />
  );
};
