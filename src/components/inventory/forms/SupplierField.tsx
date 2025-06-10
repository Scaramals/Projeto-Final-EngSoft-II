
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSuppliers } from "@/hooks/useSuppliers";

interface SupplierFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  show: boolean;
  required?: boolean;
}

export const SupplierField: React.FC<SupplierFieldProps> = ({
  value,
  onChange,
  disabled = false,
  show,
  required = false
}) => {
  const { useAllSuppliers } = useSuppliers();
  const { data: suppliers = [] } = useAllSuppliers();

  if (!show) return null;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        Fornecedor {required && <span className="text-red-500">*</span>}
      </label>
      <Select
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        required={required}
      >
        <SelectTrigger className={required && !value ? "border-red-300" : ""}>
          <SelectValue placeholder={required ? "Selecione o fornecedor (obrigatório)" : "Selecione o fornecedor"} />
        </SelectTrigger>
        <SelectContent>
          {suppliers.map(supplier => (
            <SelectItem key={supplier.id} value={supplier.id}>
              {supplier.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {required && !value && (
        <p className="text-sm text-red-500">
          Fornecedor é obrigatório para movimentações de saída
        </p>
      )}
    </div>
  );
};
