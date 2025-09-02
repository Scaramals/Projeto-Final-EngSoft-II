
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MovementTypeFieldProps {
  value: 'in' | 'out';
  onChange: (value: 'in' | 'out') => void;
  disabled?: boolean;
}

export const MovementTypeField: React.FC<MovementTypeFieldProps> = ({
  value,
  onChange,
  disabled = false
}) => {
  return (
    <div className="space-y-2">
      <label htmlFor="movement-type-field" className="text-sm font-medium">Tipo *</label>
      <Select
        value={value}
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger id="movement-type-field">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="in">Entrada</SelectItem>
          <SelectItem value="out">Saída</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
