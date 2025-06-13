
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
    console.log(`🔍 [MODAL] === INÍCIO VALIDAÇÃO ===`);
    console.log(`🔍 [MODAL] Dados para validar:`, formData);
    
    if (formData.quantity <= 0) {
      setValidationError('Quantidade deve ser maior que zero');
      console.log('❌ [MODAL] Validação falhou: quantidade <= 0');
      return false;
    }

    // NOVA VALIDAÇÃO: Fornecedor obrigatório para TODAS as movimentações (entrada e saída)
    if (!formData.supplierId) {
      if (formData.type === 'in') {
        setValidationError('Fornecedor é obrigatório para entradas de estoque');
      } else {
        setValidationError('Fornecedor é obrigatório para saídas de estoque');
      }
      console.log('❌ [MODAL] Validação falhou: fornecedor obrigatório');
      return false;
    }

    if (formData.type === 'out' && formData.quantity > currentStock) {
      setValidationError(`Quantidade não pode exceder o estoque atual (${currentStock})`);
      console.log('❌ [MODAL] Validação falhou: quantidade > estoque');
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

      // Validação adicional para fornecedor obrigatório
      if (!formData.supplierId) {
        setValidationError('Fornecedor é obrigatório para todas as movimentações');
        console.log('❌ [MODAL] Erro: fornecedor obrigatório');
        return;
      }

      // Usar a função existente validate_stock_movement para validar
      console.log(`🔍 [MODAL] Validando movimentação via RPC...`);
      const { data: validation, error: validationErr } = await supabase.rpc(
        'validate_stock_movement',
        {
          product_id_param: productId,
          quantity_param: formData.quantity,
          type_param: formData.type
        }
      );

      if (validationErr) {
        console.error('❌ [MODAL] Erro na validação RPC:', validationErr);
        throw validationErr;
      }

      // Cast do resultado para o tipo esperado
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
        quantity: formData.quantity,
        type: formData.type,
        notes: formData.notes.trim() || null,
        supplier_id: formData.supplierId, // Sempre obrigatório agora
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

      // BUSCAR ESTOQUE DEPOIS DA MOVIMENTAÇÃO
      console.log(`📊 [MODAL] Buscando estoque depois da movimentação...`);
      const { data: productAfter, error: productAfterError } = await supabase
        .from('products')
        .select('quantity, name')
        .eq('id', productId)
        .single();

      if (productAfterError) {
        console.error('❌ [MODAL] Erro ao buscar produto após movimentação:', productAfterError);
      } else {
        console.log(`📊 [MODAL] Estoque DEPOIS: ${productAfter.quantity} para produto "${productAfter.name}"`);
        
        const expectedChange = formData.type === 'in' ? formData.quantity : -formData.quantity;
        const actualChange = productAfter.quantity - productBefore.quantity;
        
        console.log(`🔍 [MODAL] ANÁLISE:`);
        console.log(`   - Mudança esperada: ${expectedChange}`);
        console.log(`   - Mudança real: ${actualChange}`);
        console.log(`   - Status: ${actualChange === expectedChange ? '✅ CORRETO' : '❌ INCORRETO'}`);
        
        if (actualChange !== expectedChange) {
          console.error(`🚨 [MODAL] DUPLICAÇÃO DETECTADA!`);
          console.error(`   - Movimentação: ${formData.type} ${formData.quantity}`);
          console.error(`   - Esperado: ${expectedChange}`);
          console.error(`   - Real: ${actualChange}`);
        }
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
