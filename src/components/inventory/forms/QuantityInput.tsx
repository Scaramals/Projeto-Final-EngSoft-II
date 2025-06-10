
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
    
    // Converter para número e garantir que seja inteiro
    const numericValue = parseInt(inputValue, 10);
    
    // Verificar se é um número válido
    if (!isNaN(numericValue) && numericValue >= 0) {
      console.log('📝 [QUANTITY] Valor válido digitado:', numericValue);
      onChange(numericValue);
    } else {
      console.log('📝 [QUANTITY] Valor inválido ignorado:', inputValue);
      // Não atualizar se o valor for inválido
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Quantidade</label>
      <Input
        type="number"
        min="1"
        step="1"
        value={value || ''}
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
