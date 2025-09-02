
import React from "react";
import { Textarea } from "@/components/ui/textarea";

interface NotesFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const NotesField: React.FC<NotesFieldProps> = ({
  value,
  onChange,
  disabled = false
}) => {
  return (
    <div className="space-y-2">
      <label htmlFor="notes-field" className="text-sm font-medium">Observações</label>
      <Textarea
        id="notes-field"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Ex: Produto danificado, devolução ao fornecedor, ajuste de inventário"
        className="min-h-[60px] resize-none"
      />
    </div>
  );
};
