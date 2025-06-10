
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
    
    // Se o campo estiver vazio, definir como 0
    if (inputValue === '') {
      onChange(0);
      return;
    }
    
    // Converter para número inteiro - FIXO: não mais dobrar valores
    const numericValue = parseInt(inputValue, 10);
    
    // Verificar se é um número válido e não NaN
    if (!isNaN(numericValue) && numericValue >= 0) {
      onChange(numericValue);
    }
    // Se inválido, não fazer nada (manter valor atual)
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Quantidade</label>
      <Input
        type="number"
        min="0"
        step="1"
        value={value === 0 ? '' : value.toString()}
        disabled={disabled}
        className={hasInsufficientStock ? "border-yellow-500" : ""}
        onChange={handleInputChange}
        placeholder="Digite a quantidade"
      />
      {type === "out" && (
        <p className={`text-sm ${hasInsufficientStock ? "text-yellow-600" : "text-muted-foreground"}`}>
          Estoque disponível: {currentStock} unidades
          {hasInsufficientStock && " - ATENÇÃO: Quantidade maior que estoque!"}
        </p>
      )}
      {error && (
        <p className="text-sm font-medium text-destructive">{error}</p>
      )}
    </div>
  );
};
