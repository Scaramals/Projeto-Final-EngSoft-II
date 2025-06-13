
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import SupplierForm from './SupplierForm';
import { useSuppliers } from '@/hooks/useSuppliers';
import { Supplier, SupplierFormData } from '@/types';

interface EditSupplierModalProps {
  supplier: Supplier | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditSupplierModal: React.FC<EditSupplierModalProps> = ({
  supplier,
  isOpen,
  onClose,
}) => {
  const { useUpdateSupplier } = useSuppliers();
  const updateSupplier = useUpdateSupplier();

  const handleSubmit = async (data: SupplierFormData) => {
    if (!supplier) return;

    try {
      await updateSupplier.mutateAsync({
        id: supplier.id,
        ...data,
      });
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar fornecedor:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Fornecedor</DialogTitle>
          <DialogDescription>
            Faça as alterações necessárias nos dados do fornecedor.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <SupplierForm
            defaultValues={supplier || undefined}
            onSubmit={handleSubmit}
            isLoading={updateSupplier.isPending}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
