
import React from "react";
import { Input } from "@/components/ui/input";

interface QuantityFieldProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export const QuantityField: React.FC<QuantityFieldProps> = ({
  value,
  onChange,
  disabled = false
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Quantidade *</label>
      <Input
        type="number"
        min="1"
        step="1"
        value={value === 0 ? '' : value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        disabled={disabled}
        placeholder="Digite a quantidade"
      />
    </div>
  );
};
