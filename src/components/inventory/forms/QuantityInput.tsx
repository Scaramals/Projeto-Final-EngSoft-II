
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
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Quantidade</label>
      <Input
        type="number"
        min="1"
        step="1"
        value={value}
        disabled={disabled}
        className={hasInsufficientStock ? "border-yellow-500" : ""}
        onChange={(e) => {
          const value = parseInt(e.target.value) || 0;
          console.log('📝 [QUANTITY] Valor digitado:', value);
          onChange(value);
        }}
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
