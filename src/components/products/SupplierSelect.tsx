
import React from 'react';
import { useSuppliers } from '@/hooks/useSuppliers';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { X } from 'lucide-react';

interface SupplierSelectProps {
  selectedSuppliers: string[];
  onSuppliersChange: (suppliers: string[]) => void;
  className?: string;
}

export const SupplierSelect: React.FC<SupplierSelectProps> = ({
  selectedSuppliers,
  onSuppliersChange,
  className = ""
}) => {
  const { useAllSuppliers } = useSuppliers();
  const { data: suppliers = [] } = useAllSuppliers();

  const handleAddSupplier = (supplierId: string) => {
    if (supplierId && !selectedSuppliers.includes(supplierId)) {
      onSuppliersChange([...selectedSuppliers, supplierId]);
    }
  };

  const handleRemoveSupplier = (supplierId: string) => {
    onSuppliersChange(selectedSuppliers.filter(id => id !== supplierId));
  };

  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier ? `${supplier.name}${supplier.cnpj ? ` - ${supplier.cnpj}` : ''}` : 'Fornecedor não encontrado';
  };

  const availableSuppliers = suppliers.filter(
    supplier => !selectedSuppliers.includes(supplier.id)
  );

  return (
    <div className={`space-y-3 ${className}`}>
      <div>
        <label className="text-sm font-medium">Fornecedores</label>
        <Select onValueChange={handleAddSupplier}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Adicionar fornecedor" />
          </SelectTrigger>
          <SelectContent>
            {availableSuppliers.length === 0 ? (
              <SelectItem value="" disabled>
                {suppliers.length === 0 ? 'Nenhum fornecedor cadastrado' : 'Todos os fornecedores já foram selecionados'}
              </SelectItem>
            ) : (
              availableSuppliers.map((supplier) => (
                <SelectItem key={supplier.id} value={supplier.id}>
                  {supplier.name}
                  {supplier.cnpj && (
                    <span className="text-sm text-muted-foreground ml-2">
                      - {supplier.cnpj}
                    </span>
                  )}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {selectedSuppliers.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Fornecedores selecionados:
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedSuppliers.map((supplierId) => (
              <Badge
                key={supplierId}
                variant="secondary"
                className="flex items-center gap-1 pr-1"
              >
                <span className="text-xs">{getSupplierName(supplierId)}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0.5 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => handleRemoveSupplier(supplierId)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
