
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

  // Conversão de string para número
  const parseCurrency = (str: string): number => {
    const numericString = str.replace(/[^\d,]/g, '').replace(',', '.');
    const numericValue = parseFloat(numericString) || 0;
    return numericValue;
  };

  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(formatCurrency(value));
    }
  }, [value, isFocused]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    if (isFocused) {
      // Durante a digitação, permite entrada mais flexível
      setDisplayValue(inputValue);
      
      // Converte para número e chama onChange
      const numericValue = parseCurrency(inputValue);
      onChange(numericValue);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    // Converte para formato de edição (sem símbolos, apenas números e vírgula)
    const editableValue = value > 0 ? value.toFixed(2).replace('.', ',') : '';
    setDisplayValue(editableValue);
    
    // Seleciona todo o texto
    setTimeout(() => {
      e.target.select();
    }, 0);
    
    if (props.onFocus) props.onFocus(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    // Volta para o formato de exibição
    setDisplayValue(formatCurrency(value));
    
    if (props.onBlur) props.onBlur(e);
  };

  return (
    <Input
      {...props}
      type="text"
      value={displayValue}
      onChange={handleInputChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={cn(className)}
    />
  );
};
