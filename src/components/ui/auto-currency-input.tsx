
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

interface AutoCurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number;
  onChange: (value: number) => void;
}

export const AutoCurrencyInput: React.FC<AutoCurrencyInputProps> = ({
  value,
  onChange,
  ...props
}) => {
  // Estado para controlar o valor formatado exibido no input
  const [displayValue, setDisplayValue] = useState("");
  
  // Formata o valor como moeda
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };
  
  // Parse do valor formatado para número
  const parseCurrency = (value: string): number => {
    // Remove todos os caracteres não numéricos, exceto vírgula e ponto
    const cleanValue = value.replace(/[^\d,.-]/g, '');
    
    // Converte vírgula para ponto para poder fazer o parseFloat
    const normalizedValue = cleanValue.replace(',', '.');
    
    // Converte para número
    return parseFloat(normalizedValue) || 0;
  };
  
  // Atualiza o estado quando o valor da prop mudar
  useEffect(() => {
    setDisplayValue(formatCurrency(value));
  }, [value]);

  // Manipula a mudança do valor no input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputVal = e.target.value;
    
    // Se estiver vazio, zera o valor
    if (inputVal === '') {
      onChange(0);
      setDisplayValue('R$ 0,00');
      return;
    }
    
    // Remove formatação para obter apenas o número
    const numValue = parseCurrency(inputVal);
    
    // Atualiza o valor no componente pai
    onChange(numValue);
    
    // Formata o valor para exibição
    setDisplayValue(formatCurrency(numValue));
  };

  return (
    <Input
      {...props}
      value={displayValue}
      onChange={handleChange}
      onFocus={(e) => {
        // Seleciona todo o texto quando o campo recebe foco
        e.target.select();
        // Chama o manipulador onFocus original se existir
        if (props.onFocus) props.onFocus(e);
      }}
    />
  );
};
