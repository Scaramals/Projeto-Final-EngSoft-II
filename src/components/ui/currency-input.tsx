
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { formatCurrency, parseCurrency } from "@/utils/formatters";

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number;
  onChange: (value: number) => void;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  ...props
}) => {
  // Estado para controlar o valor formatado exibido no input
  const [displayValue, setDisplayValue] = useState(formatCurrency(value));
  
  // Atualiza o estado quando o valor da prop mudar
  useEffect(() => {
    setDisplayValue(formatCurrency(value));
  }, [value]);

  // Manipula a mudança do valor no input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputVal = e.target.value;
    
    // Permite digitar sem formatação inicialmente
    if (inputVal === '') {
      onChange(0);
      setDisplayValue('R$ 0,00');
      return;
    }
    
    // Remove todos os caracteres não numéricos, exceto vírgula e ponto
    inputVal = inputVal.replace(/[^\d,.-]/g, '');
    
    // Substitui vírgula por ponto para conversão correta
    const numberValue = parseCurrency(inputVal);
    
    // Atualiza o valor para o componente pai
    onChange(numberValue);
    
    // Não formata imediatamente durante a digitação para melhor UX
    setDisplayValue(inputVal.startsWith('R$') ? inputVal : `R$ ${inputVal}`);
  };

  // Formata corretamente quando o campo perde o foco
  const handleBlur = () => {
    setDisplayValue(formatCurrency(value));
  };

  return (
    <Input
      {...props}
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={(e) => {
        // Seleciona todo o texto quando o campo recebe foco
        e.target.select();
        // Chama o manipulador onFocus original se existir
        if (props.onFocus) props.onFocus(e);
      }}
    />
  );
};
