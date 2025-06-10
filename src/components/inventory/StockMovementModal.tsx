
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSuppliers } from "@/hooks/useSuppliers";
import { Loader2, AlertTriangle, CheckCircle } from "lucide-react";

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
  const { useAllSuppliers } = useSuppliers();
  const { data: suppliers = [] } = useAllSuppliers();

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

    if (formData.type === 'in' && !formData.supplierId) {
      setValidationError('Fornecedor é obrigatório para entradas de estoque');
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
      // Validação adicional para entrada sem fornecedor
      if (formData.type === 'in' && !formData.supplierId) {
        setValidationError('Entrada de estoque obrigatoriamente deve ter um fornecedor');
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

      // Inserir movimentação diretamente - o trigger cuidará do resto
      const { error: insertError } = await supabase
        .from('stock_movements')
        .insert({
          product_id: productId,
          quantity: formData.quantity,
          type: formData.type,
          notes: formData.notes.trim() || null,
          supplier_id: formData.type === 'in' ? formData.supplierId : null,
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Movimentação de Estoque</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Status do estoque */}
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>{productName}</strong><br />
              Estoque atual: {currentStock} unidades
            </AlertDescription>
          </Alert>

          {/* Erro de validação */}
          {validationError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          {/* Tipo de movimentação */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo *</label>
            <Select
              value={formData.type}
              onValueChange={(value: 'in' | 'out') => {
                setFormData(prev => ({ ...prev, type: value }));
                setValidationError(null);
              }}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in">Entrada</SelectItem>
                <SelectItem value="out">Saída</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quantidade */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Quantidade *</label>
            <Input
              type="number"
              min="1"
              step="1"
              value={formData.quantity}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }));
                setValidationError(null);
              }}
              disabled={isSubmitting}
            />
          </div>

          {/* Fornecedor (obrigatório para entradas) */}
          {formData.type === 'in' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Fornecedor *</label>
              <Select
                value={formData.supplierId}
                onValueChange={(value) => {
                  setFormData(prev => ({ ...prev, supplierId: value }));
                  setValidationError(null);
                }}
                disabled={isSubmitting}
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
          )}

          {/* Observações */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Observações</label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              disabled={isSubmitting}
              placeholder="Observações opcionais..."
              className="min-h-[60px]"
            />
          </div>

          {/* Ações */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !!validationError}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Registrando...
                </>
              ) : (
                "Registrar"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
