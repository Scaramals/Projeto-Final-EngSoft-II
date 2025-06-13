
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { StockStatusDisplay } from "./forms/StockStatusDisplay";
import { ErrorAlert } from "./forms/ErrorAlert";
import { MovementTypeField } from "./forms/MovementTypeField";
import { QuantityInput } from "./forms/QuantityInput";
import { SupplierField } from "./forms/SupplierField";
import { NotesField } from "./forms/NotesField";
import { FormActions } from "./forms/FormActions";
import { AutoCurrencyInput } from "@/components/ui/auto-currency-input";

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
    quantity: '',
    price: 0,
    notes: '',
    supplierId: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateForm = () => {
    console.log(`🔍 [MODAL] === INÍCIO VALIDAÇÃO ===`);
    console.log(`🔍 [MODAL] Dados para validar:`, formData);
    
    const quantityValue = parseInt(formData.quantity) || 0;
    
    if (quantityValue <= 0) {
      setValidationError('Quantidade deve ser maior que zero');
      console.log('❌ [MODAL] Validação falhou: quantidade <= 0');
      return false;
    }

    if (!formData.supplierId) {
      if (formData.type === 'in') {
        setValidationError('Fornecedor é obrigatório para entradas de estoque');
      } else {
        setValidationError('Fornecedor é obrigatório para saídas de estoque');
      }
      console.log('❌ [MODAL] Validação falhou: fornecedor obrigatório');
      return false;
    }

    if (formData.type === 'out' && quantityValue > currentStock) {
      setValidationError(`Quantidade não pode exceder o estoque atual (${currentStock})`);
      console.log('❌ [MODAL] Validação falhou: quantidade > estoque');
      return false;
    }

    if (formData.price <= 0) {
      setValidationError('Preço deve ser maior que zero');
      console.log('❌ [MODAL] Validação falhou: preço <= 0');
      return false;
    }

    setValidationError(null);
    console.log('✅ [MODAL] Validação passou');
    console.log(`🔍 [MODAL] === FIM VALIDAÇÃO ===`);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log(`🚀 [MODAL] === INÍCIO SUBMIT ===`);
    console.log(`🚀 [MODAL] Dados do formulário:`, formData);
    console.log(`🚀 [MODAL] isSubmitting atual:`, isSubmitting);
    console.log(`🚀 [MODAL] Estoque atual:`, currentStock);
    console.log(`🚀 [MODAL] Timestamp:`, new Date().toISOString());
    
    if (!validateForm() || isSubmitting) {
      console.log('🚫 [MODAL] Submit bloqueado - validação falhou ou já em andamento');
      return;
    }

    console.log('🚀 [MODAL] Iniciando submissão...');
    setIsSubmitting(true);

    try {
      const quantityValue = parseInt(formData.quantity) || 0;

      // BUSCAR ESTOQUE ANTES DA MOVIMENTAÇÃO
      console.log(`📊 [MODAL] Buscando estoque antes da movimentação...`);
      const { data: productBefore, error: productError } = await supabase
        .from('products')
        .select('quantity, name')
        .eq('id', productId)
        .single();

      if (productError) {
        console.error('❌ [MODAL] Erro ao buscar produto:', productError);
        throw productError;
      }

      console.log(`📊 [MODAL] Estoque ANTES: ${productBefore.quantity} para produto "${productBefore.name}"`);

      // Usar a função existente validate_stock_movement para validar
      console.log(`🔍 [MODAL] Validando movimentação via RPC...`);
      const { data: validation, error: validationErr } = await supabase.rpc(
        'validate_stock_movement',
        {
          product_id_param: productId,
          quantity_param: quantityValue,
          type_param: formData.type
        }
      );

      if (validationErr) {
        console.error('❌ [MODAL] Erro na validação RPC:', validationErr);
        throw validationErr;
      }

      const validationResult = validation as any;
      console.log(`🔍 [MODAL] Resultado da validação:`, validationResult);
      
      if (!validationResult.isValid) {
        setValidationError(validationResult.message);
        console.log('❌ [MODAL] Validação RPC falhou:', validationResult.message);
        return;
      }

      // Inserir movimentação com fornecedor obrigatório
      console.log(`💾 [MODAL] Inserindo movimentação no banco...`);
      const movementData = {
        product_id: productId,
        quantity: quantityValue,
        type: formData.type,
        notes: formData.notes.trim() || null,
        supplier_id: formData.supplierId,
        date: new Date().toISOString()
      };
      
      console.log(`💾 [MODAL] Dados da movimentação:`, movementData);
      
      const { data: insertedMovement, error: insertError } = await supabase
        .from('stock_movements')
        .insert(movementData)
        .select()
        .single();

      if (insertError) {
        console.error('❌ [MODAL] Erro ao inserir movimentação:', insertError);
        throw insertError;
      }

      console.log('✅ [MODAL] Movimentação inserida:', insertedMovement);

      toast({
        title: "Movimentação registrada",
        description: `${formData.type === 'in' ? 'Entrada' : 'Saída'} de ${quantityValue} unidades registrada com sucesso.`,
      });

      // Reset form
      setFormData({
        type: 'in',
        quantity: '',
        price: 0,
        notes: '',
        supplierId: ''
      });
      
      console.log('🚀 [MODAL] === FIM SUBMIT (SUCESSO) ===');
      onSuccess();
      onClose();

    } catch (error: any) {
      console.error('❌ [MODAL] Erro na submissão:', error);
      console.log('🚀 [MODAL] === FIM SUBMIT (ERRO) ===');
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

  const handleQuantityChange = (value: string) => {
    setFormData(prev => ({ ...prev, quantity: value }));
    setValidationError(null);
  };

  const handlePriceChange = (value: number) => {
    setFormData(prev => ({ ...prev, price: value }));
    setValidationError(null);
  };

  const handleSupplierChange = (value: string) => {
    setFormData(prev => ({ ...prev, supplierId: value }));
    setValidationError(null);
  };

  const handleNotesChange = (value: string) => {
    setFormData(prev => ({ ...prev, notes: value }));
  };

  const quantityValue = parseInt(formData.quantity) || 0;
  const hasInsufficientStock = formData.type === 'out' && quantityValue > currentStock;

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

          {/* Campo de quantidade melhorado */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Quantidade*</label>
            <input
              type="text"
              value={formData.quantity}
              onChange={(e) => {
                const value = e.target.value;
                // Permite apenas números
                if (value === '' || /^\d+$/.test(value)) {
                  handleQuantityChange(value);
                }
              }}
              disabled={isSubmitting}
              className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                hasInsufficientStock ? "border-yellow-500" : ""
              }`}
              placeholder="Digite a quantidade..."
            />
            {formData.type === "out" && (
              <p className={`text-sm ${hasInsufficientStock ? "text-yellow-600" : "text-muted-foreground"}`}>
                Estoque disponível: {currentStock} unidades
                {hasInsufficientStock && " - ATENÇÃO: Quantidade maior que estoque!"}
              </p>
            )}
            {formData.quantity !== '' && quantityValue === 0 && (
              <p className="text-sm font-medium text-destructive">
                Quantidade deve ser maior que zero
              </p>
            )}
          </div>

          {/* Campo de preço elegante */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Preço unitário*</label>
            <AutoCurrencyInput
              value={formData.price}
              onChange={handlePriceChange}
              placeholder="R$ 0,00"
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Preço por unidade para esta movimentação
            </p>
          </div>

          <SupplierField
            value={formData.supplierId}
            onChange={handleSupplierChange}
            disabled={isSubmitting}
            show={true}
            required={true}
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
