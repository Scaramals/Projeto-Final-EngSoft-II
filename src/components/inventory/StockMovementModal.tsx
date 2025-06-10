
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { StockStatusDisplay } from "./forms/StockStatusDisplay";
import { ErrorAlert } from "./forms/ErrorAlert";
import { MovementTypeField } from "./forms/MovementTypeField";
import { QuantityField } from "./forms/QuantityField";
import { SupplierField } from "./forms/SupplierField";
import { NotesField } from "./forms/NotesField";
import { FormActions } from "./forms/FormActions";

interface StockMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  currentStock: number;
  onSuccess: () => void;
}

export const StockMovementModal: React.FC<StockMovementModalProps> = ({
  isOpen,
  onClose,
  productId,
  productName,
  currentStock,
  onSuccess
}) => {
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    type: 'in' as 'in' | 'out',
    quantity: 1,
    notes: '',
    supplierId: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateForm = () => {
    if (formData.quantity <= 0) {
      setValidationError('Quantidade deve ser maior que zero');
      return false;
    }

    // NOVA VALIDAÇÃO: Fornecedor obrigatório para TODAS as movimentações (entrada e saída)
    if (!formData.supplierId) {
      if (formData.type === 'in') {
        setValidationError('Fornecedor é obrigatório para entradas de estoque');
      } else {
        setValidationError('Fornecedor é obrigatório para saídas de estoque');
      }
      return false;
    }

    if (formData.type === 'out' && formData.quantity > currentStock) {
      setValidationError(`Quantidade não pode exceder o estoque atual (${currentStock})`);
      return false;
    }

    setValidationError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Validação adicional para fornecedor obrigatório
      if (!formData.supplierId) {
        setValidationError('Fornecedor é obrigatório para todas as movimentações');
        return;
      }

      // Usar a função existente validate_stock_movement para validar
      const { data: validation, error: validationErr } = await supabase.rpc(
        'validate_stock_movement',
        {
          product_id_param: productId,
          quantity_param: formData.quantity,
          type_param: formData.type
        }
      );

      if (validationErr) {
        throw validationErr;
      }

      // Cast do resultado para o tipo esperado
      const validationResult = validation as any;
      
      if (!validationResult.isValid) {
        setValidationError(validationResult.message);
        return;
      }

      // Inserir movimentação com fornecedor obrigatório
      const { error: insertError } = await supabase
        .from('stock_movements')
        .insert({
          product_id: productId,
          quantity: formData.quantity,
          type: formData.type,
          notes: formData.notes.trim() || null,
          supplier_id: formData.supplierId, // Sempre obrigatório agora
          date: new Date().toISOString()
        });

      if (insertError) {
        throw insertError;
      }

      toast({
        title: "Movimentação registrada",
        description: `${formData.type === 'in' ? 'Entrada' : 'Saída'} de ${formData.quantity} unidades registrada com sucesso.`,
      });

      // Reset form
      setFormData({
        type: 'in',
        quantity: 1,
        notes: '',
        supplierId: ''
      });
      
      onSuccess();
      onClose();

    } catch (error: any) {
      console.error('Erro ao registrar movimentação:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao registrar movimentação",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTypeChange = (value: 'in' | 'out') => {
    setFormData(prev => ({ ...prev, type: value }));
    setValidationError(null);
  };

  const handleQuantityChange = (value: number) => {
    setFormData(prev => ({ ...prev, quantity: value }));
    setValidationError(null);
  };

  const handleSupplierChange = (value: string) => {
    setFormData(prev => ({ ...prev, supplierId: value }));
    setValidationError(null);
  };

  const handleNotesChange = (value: string) => {
    setFormData(prev => ({ ...prev, notes: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Movimentação de Estoque</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <StockStatusDisplay 
            productName={productName}
            currentStock={currentStock}
          />

          <ErrorAlert error={validationError} />

          <MovementTypeField
            value={formData.type}
            onChange={handleTypeChange}
            disabled={isSubmitting}
          />

          <QuantityField
            value={formData.quantity}
            onChange={handleQuantityChange}
            disabled={isSubmitting}
          />

          {/* Fornecedor agora é obrigatório para TODAS as movimentações */}
          <SupplierField
            value={formData.supplierId}
            onChange={handleSupplierChange}
            disabled={isSubmitting}
            show={true} // Sempre mostrar
            required={true} // Sempre obrigatório
          />

          <NotesField
            value={formData.notes}
            onChange={handleNotesChange}
            disabled={isSubmitting}
          />

          <FormActions
            onCancel={onClose}
            isSubmitting={isSubmitting}
            hasValidationError={!!validationError}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
};
