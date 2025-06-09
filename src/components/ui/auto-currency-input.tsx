
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface AutoCurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

export const AutoCurrencyInput: React.FC<AutoCurrencyInputProps> = ({
  value,
  onChange,
  className,
  ...props
}) => {
  const [displayValue, setDisplayValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Formatar valor como moeda
  const formatCurrency = (amount: number): string => {
    if (amount === 0) return "";
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Atualizar display quando value mudar
  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(formatCurrency(value));
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;
    
    // Remove tudo que não é dígito
    const numbers = inputValue.replace(/\D/g, '');
    
    if (numbers === '') {
      onChange(0);
      setDisplayValue('');
      return;
    }
    
    // Converte para centavos (shift decimal)
    const cents = parseInt(numbers, 10);
    const reais = cents / 100;
    
    onChange(reais);
    
    // Durante a digitação, mostra apenas os números formatados
    setDisplayValue(formatCurrency(reais));
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    if (value === 0) {
      setDisplayValue('');
    }
    e.target.select();
    if (props.onFocus) props.onFocus(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    setDisplayValue(formatCurrency(value));
    if (props.onBlur) props.onBlur(e);
  };

  return (
    <Input
      {...props}
      type="text"
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder="R$ 0,00"
      className={cn(className)}
    />
  );
};
