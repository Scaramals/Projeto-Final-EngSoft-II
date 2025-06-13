
import React from "react";
import { Input } from "@/components/ui/input";

interface QuantityInputProps {
  value: number;
  onChange: (value: number) => void;
  type: 'in' | 'out';
  currentStock: number;
  hasInsufficientStock: boolean;
  disabled: boolean;
  error?: string;
}

export const QuantityInput: React.FC<QuantityInputProps> = ({
  value,
  onChange,
  type,
  currentStock,
  hasInsufficientStock,
  disabled,
  error
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    if (inputValue === '') {
      onChange(0);
      return;
    }
    
    const numericValue = parseInt(inputValue, 10);
    
    if (!isNaN(numericValue) && numericValue >= 0) {
      onChange(numericValue);
    }
  };

  const getPlaceholder = () => {
    if (type === 'in') {
      return "Digite a quantidade de entrada";
    }
    return "Digite a quantidade de saída";
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Quantidade*</label>
      <Input
        type="number"
        min="1"
        step="1"
        value={value === 0 ? '' : value.toString()}
        disabled={disabled}
        className={hasInsufficientStock ? "border-yellow-500" : ""}
        onChange={handleInputChange}
        placeholder={getPlaceholder()}
      />
      {type === "out" && (
        <p className={`text-sm ${hasInsufficientStock ? "text-yellow-600" : "text-muted-foreground"}`}>
          Estoque disponível: {currentStock} unidades
          {hasInsufficientStock && " - ATENÇÃO: Quantidade maior que estoque!"}
        </p>
      )}
      {value === 0 && (
        <p className="text-sm font-medium text-destructive">
          Quantidade é obrigatória e deve ser maior que zero
        </p>
      )}
      {error && (
        <p className="text-sm font-medium text-destructive">{error}</p>
      )}
    </div>
  );
};
