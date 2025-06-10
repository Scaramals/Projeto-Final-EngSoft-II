
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStockMovements } from "@/hooks/useStockMovements";
import { useToast } from "@/hooks/use-toast";
import { StockValidationService } from "@/services/stockValidationService";
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

  // Form state
  const [type, setType] = useState<'in' | 'out'>('in');
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  const [supplierId, setSupplierId] = useState<string>('');

  // Form errors
  const [errors, setErrors] = useState(validateStockMovementForm('', 0));

  const { useCreateStockMovement } = useStockMovements();
  const createMovementMutation = useCreateStockMovement();

  // Validação em tempo real quando mudar tipo ou quantidade
  useEffect(() => {
    const validateMovement = async () => {
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
          const validation = await StockValidationService.validateMovement(
            productId, 
            quantity, 
            type
          );
          
          console.log('✅ [FORM] Resultado da validação:', validation);
          setCurrentValidatedStock(validation.currentStock);
          
          if (!validation.valid) {
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

    // Evitar duplo envio
    if (isSubmitting || hasSubmitted) {
      console.log('🚫 [FORM] Bloqueando duplo envio');
      return;
    }

    const formErrors = validateStockMovementForm(type, quantity);
    setErrors(formErrors);

    if (hasValidationErrors(formErrors)) {
      return;
    }

    console.log('🎯 [FORM] === INICIANDO ENVIO ===');
    console.log('🎯 [FORM] Dados do formulário:', { type, quantity, notes, supplierId });
    console.log('🎯 [FORM] Produto ID:', productId);

    setIsSubmitting(true);
    setHasSubmitted(true);

    try {
      // Validação final antes do envio
      if (type === 'out') {
        console.log('🔍 [FORM] Validação final antes do envio...');
        const finalValidation = await StockValidationService.validateMovement(
          productId,
          quantity,
          type
        );

        if (!finalValidation.valid) {
          console.error('❌ [FORM] Validação final falhou:', finalValidation.message);
          toast({
            title: "Erro de validação",
            description: finalValidation.message,
            variant: "destructive",
          });
          return;
        }
      }

      console.log('📤 [FORM] Enviando para a API...');
      await createMovementMutation.mutateAsync({
        productId,
        quantity,
        type,
        notes: notes || "",
        supplierId: supplierId || null,
      });

      console.log('✅ [FORM] Movimentação registrada com sucesso!');
      
      toast({
        title: "Sucesso!",
        description: `${type === 'in' ? 'Entrada' : 'Saída'} de ${quantity} unidades registrada.`,
      });

      // Aguardar um pouco antes de chamar onSubmit para garantir que a mutação foi processada
      setTimeout(() => {
        onSubmit();
      }, 500);

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
