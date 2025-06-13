
import React from "react";
import { Textarea } from "@/components/ui/textarea";

interface NotesInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

export const NotesInput: React.FC<NotesInputProps> = ({
  value,
  onChange,
  disabled
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Observações (opcional)</label>
      <Textarea
        placeholder="Ex: Produto recebido em perfeito estado, nota fiscal 12345, fornecedor entregou no prazo"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[80px] resize-none"
      />
    </div>
  );
};
