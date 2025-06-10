
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MovementTypeSelectProps {
  value: 'in' | 'out';
  onChange: (value: 'in' | 'out') => void;
  disabled: boolean;
}

export const MovementTypeSelect: React.FC<MovementTypeSelectProps> = ({
  value,
  onChange,
  disabled
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Tipo de movimentação</label>
      <Select
        value={value}
        onValueChange={(value: 'in' | 'out') => {
          console.log('🔄 [TYPE] Tipo selecionado:', value);
          onChange(value);
        }}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecione o tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="in">Entrada</SelectItem>
          <SelectItem value="out">Saída</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
