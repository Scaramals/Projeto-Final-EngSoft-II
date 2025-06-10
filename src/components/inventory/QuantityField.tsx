
import React from "react";
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ControllerRenderProps } from "react-hook-form";

interface QuantityFieldProps {
  field: ControllerRenderProps<any, "quantity">;
  movementType: 'in' | 'out';
  currentStock: number;
  isLoading: boolean;
  hasInsufficientStock: boolean;
}

export const QuantityField: React.FC<QuantityFieldProps> = ({
  field,
  movementType,
  currentStock,
  isLoading,
  hasInsufficientStock
}) => {
  return (
    <FormItem>
      <FormLabel>Quantidade</FormLabel>
      <FormControl>
        <Input
          type="number"
          min="1"
          step="1"
          disabled={isLoading}
          {...field}
          className={hasInsufficientStock ? "border-yellow-500" : ""}
          onChange={(e) => {
            // Garantir que apenas números inteiros positivos sejam aceitos
            const value = parseInt(e.target.value) || 0;
            console.log('📝 [QUANTITY] Valor digitado:', value);
            field.onChange(value);
          }}
        />
      </FormControl>
      {movementType === "out" && (
        <FormDescription className={hasInsufficientStock ? "text-yellow-600" : ""}>
          Estoque disponível: {currentStock} unidades
          {hasInsufficientStock && " - ATENÇÃO: Quantidade maior que estoque!"}
        </FormDescription>
      )}
      <FormMessage />
    </FormItem>
  );
};
