
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { StockService } from "@/services/stockService";
import { validateStockMovementForm, hasValidationErrors } from "@/services/stockMovementValidation";
import { StockStatusAlert } from "./forms/StockStatusAlert";
import { MovementTypeSelect } from "./forms/MovementTypeSelect";
import { QuantityInput } from "./forms/QuantityInput";
import { NotesInput } from "./forms/NotesInput";
import { FormActions } from "./forms/FormActions";

interface StockMovementFormProps {
  productId: string;
  onSubmit: () => void;
  onCancel: () => void;
  currentStock: number;
}

export const StockMovementForm: React.FC<StockMovementFormProps> = ({
  productId,
  onSubmit,
  onCancel,
  currentStock,
}) => {
  const { toast } = useToast();
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [currentValidatedStock, setCurrentValidatedStock] = useState(currentStock);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Form state com valores iniciais seguros
  const [type, setType] = useState<'in' | 'out'>('in');
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  const [supplierId, setSupplierId] = useState<string>('');

  // Form errors
  const [errors, setErrors] = useState(validateStockMovementForm('', 0));

  // Validação em tempo real quando mudar tipo ou quantidade
  useEffect(() => {
    const validateMovement = async () => {
      // Limpar erro se não há tipo ou quantidade válida
      if (!type || !quantity || quantity <= 0) {
        setValidationError(null);
        return;
      }

      console.log('🔍 [FORM] === VALIDAÇÃO EM TEMPO REAL ===');
      console.log('🔍 [FORM] Tipo:', type);
      console.log('🔍 [FORM] Quantidade:', quantity);
      console.log('🔍 [FORM] Produto ID:', productId);

      if (type === 'out') {
        setIsValidating(true);
        try {
          const validation = await StockService.validateMovement(
            productId, 
            quantity, 
            type
          );
          
          console.log('✅ [FORM] Resultado da validação:', validation);
          setCurrentValidatedStock(validation.currentStock);
          
          if (!validation.isValid) {
            setValidationError(validation.message || 'Erro na validação');
          } else {
            setValidationError(null);
          }
        } catch (error) {
          console.error('❌ [FORM] Erro na validação:', error);
          setValidationError('Erro ao validar movimentação');
        } finally {
          setIsValidating(false);
        }
      } else {
        setValidationError(null);
        setCurrentValidatedStock(currentStock);
      }
    };

    validateMovement();
  }, [type, quantity, productId, currentStock]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // PROTEÇÃO CRÍTICA: Evitar execução múltipla
    if (isSubmitting || hasSubmitted) {
      console.log('🚫 [FORM] Bloqueando execução múltipla');
      console.log('🚫 [FORM] isSubmitting:', isSubmitting);
      console.log('🚫 [FORM] hasSubmitted:', hasSubmitted);
      return;
    }

    // Validação de dados antes do envio
    console.log('🔍 [FORM] === VALIDAÇÃO ANTES DO ENVIO ===');
    console.log('🔍 [FORM] Tipo:', type, typeof type);
    console.log('🔍 [FORM] Quantidade:', quantity, typeof quantity);
    console.log('🔍 [FORM] Product ID:', productId, typeof productId);

    // Garantir que quantity é um número inteiro válido
    const validQuantity = parseInt(String(quantity), 10);
    if (isNaN(validQuantity) || validQuantity <= 0) {
      toast({
        title: "Erro de validação",
        description: "Quantidade deve ser um número inteiro maior que 0",
        variant: "destructive",
      });
      return;
    }

    const formErrors = validateStockMovementForm(type, validQuantity);
    setErrors(formErrors);

    if (hasValidationErrors(formErrors)) {
      console.log('❌ [FORM] Erros de validação:', formErrors);
      return;
    }

    console.log('🎯 [FORM] === INICIANDO ENVIO ===');
    console.log('🎯 [FORM] Dados validados:', { 
      type, 
      quantity: validQuantity, 
      notes, 
      supplierId: supplierId || null,
      productId 
    });

    // MARCAR COMO SUBMETENDO IMEDIATAMENTE
    setIsSubmitting(true);
    setHasSubmitted(true);

    try {
      // Validação final antes do envio para movimentações de saída
      if (type === 'out') {
        console.log('🔍 [FORM] Validação final antes do envio...');
        const finalValidation = await StockService.validateMovement(
          productId,
          validQuantity,
          type
        );

        if (!finalValidation.isValid) {
          console.error('❌ [FORM] Validação final falhou:', finalValidation.message);
          toast({
            title: "Erro de validação",
            description: finalValidation.message,
            variant: "destructive",
          });
          setIsSubmitting(false);
          setHasSubmitted(false);
          return;
        }
      }

      console.log('📤 [FORM] Enviando para a API...');
      const result = await StockService.createMovement({
        productId,
        quantity: validQuantity,
        type,
        notes: notes.trim() || "",
        supplierId: supplierId || undefined,
      });

      if (result.success) {
        console.log('✅ [FORM] Movimentação registrada com sucesso!');
        
        toast({
          title: "Movimentação registrada",
          description: `${type === 'in' ? 'Entrada' : 'Saída'} de ${validQuantity} unidades registrada com sucesso.`,
        });
        
        // Aguardar um pouco antes de chamar onSubmit para garantir que o cache seja atualizado
        setTimeout(() => {
          onSubmit();
        }, 1000);
      } else {
        throw new Error(result.message || 'Erro ao registrar movimentação');
      }

    } catch (error: any) {
      console.error('❌ [FORM] Erro ao registrar movimentação:', error);
      
      let errorMessage = "Erro ao registrar movimentação";
      if (error?.message?.includes('Estoque insuficiente')) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Permitir nova tentativa em caso de erro
      setHasSubmitted(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasInsufficientStock = validationError !== null && type === 'out';

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Registrar Movimentação de Estoque</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <StockStatusAlert 
            currentStock={currentValidatedStock}
            validationError={validationError}
          />

          <MovementTypeSelect
            value={type}
            onChange={setType}
            disabled={isSubmitting || isValidating}
          />
          {errors.type && (
            <p className="text-sm font-medium text-destructive">{errors.type}</p>
          )}

          <QuantityInput
            value={quantity}
            onChange={setQuantity}
            type={type}
            currentStock={currentValidatedStock}
            hasInsufficientStock={hasInsufficientStock}
            disabled={isSubmitting || isValidating}
            error={errors.quantity}
          />

          <NotesInput
            value={notes}
            onChange={setNotes}
            disabled={isSubmitting || isValidating}
          />

          <FormActions
            onCancel={onCancel}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            isValidating={isValidating}
            hasInsufficientStock={hasInsufficientStock}
            hasSubmitted={hasSubmitted}
          />
        </form>
      </CardContent>
    </Card>
  );
};
