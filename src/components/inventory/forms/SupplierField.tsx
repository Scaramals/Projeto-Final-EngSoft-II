
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSuppliers } from "@/hooks/useSuppliers";

interface SupplierFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  show: boolean;
}

export const SupplierField: React.FC<SupplierFieldProps> = ({
  value,
  onChange,
  disabled = false,
  show
}) => {
  const { useAllSuppliers } = useSuppliers();
  const { data: suppliers = [] } = useAllSuppliers();

  if (!show) return null;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Fornecedor *</label>
      <Select
        value={value}
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecione o fornecedor" />
        </SelectTrigger>
        <SelectContent>
          {suppliers.map(supplier => (
            <SelectItem key={supplier.id} value={supplier.id}>
              {supplier.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
