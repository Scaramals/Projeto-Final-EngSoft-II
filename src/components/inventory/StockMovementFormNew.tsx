
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { StockService } from "@/services/stockService";
import { useStockForm } from "@/hooks/useStockForm";
import { StockLoadingAlert } from "./forms/StockLoadingAlert";
import { StockStatusAlert } from "./forms/StockStatusAlert";
import { ValidationAlert } from "./forms/ValidationAlert";
import { ErrorAlert } from "./forms/ErrorAlert";
import { MovementTypeSelect } from "./forms/MovementTypeSelect";
import { QuantityInput } from "./forms/QuantityInput";
import { NotesInput } from "./forms/NotesInput";
import { FormActions } from "./forms/FormActions";

interface StockMovementFormNewProps {
  productId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const StockMovementFormNew: React.FC<StockMovementFormNewProps> = ({
  productId,
  onSuccess,
  onCancel
}) => {
  const { toast } = useToast();
  const [currentStock, setCurrentStock] = useState(0);
  const [isLoadingStock, setIsLoadingStock] = useState(true);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const {
    formData,
    errors,
    isSubmitting,
    setIsSubmitting,
    updateField,
    validateForm,
    resetForm,
    setErrors
  } = useStockForm();

  // Carregar estoque atual
  useEffect(() => {
    const loadCurrentStock = async () => {
      setIsLoadingStock(true);
      try {
        const stock = await StockService.getCurrentStock(productId);
        setCurrentStock(stock);
      } catch (error) {
        console.error('Erro ao carregar estoque:', error);
        setCurrentStock(0);
      } finally {
        setIsLoadingStock(false);
      }
    };

    if (productId) {
      loadCurrentStock();
    }
  }, [productId]);

  // Validação em tempo real para saídas
  useEffect(() => {
    if (formData.type === 'out' && formData.quantity > 0) {
      const validateRealTime = async () => {
        setIsValidating(true);
        try {
          const validation = await StockService.validateMovement(
            productId,
            formData.quantity,
            formData.type
          );

          if (!validation.isValid) {
            setValidationMessage(validation.message || null);
          } else {
            setValidationMessage(null);
          }
        } catch (error) {
          console.error('Erro na validação:', error);
          setValidationMessage('Erro ao validar movimentação');
        } finally {
          setIsValidating(false);
        }
      };

      const timeoutId = setTimeout(validateRealTime, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setValidationMessage(null);
      setIsValidating(false);
    }
  }, [formData.type, formData.quantity, productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevenir submissão múltipla
    if (isSubmitting) {
      console.log('🚫 Submissão bloqueada - já em andamento');
      return;
    }

    // Validar formulário
    if (!validateForm(currentStock)) {
      console.log('❌ Validação do formulário falhou');
      return;
    }

    // Verificar se há erro de validação
    if (validationMessage) {
      toast({
        title: "Erro de validação",
        description: validationMessage,
        variant: "destructive",
      });
      return;
    }

    console.log('🚀 Iniciando submissão:', formData);
    setIsSubmitting(true);

    try {
      const result = await StockService.createMovement({
        productId,
        quantity: formData.quantity,
        type: formData.type,
        notes: formData.notes.trim() || undefined,
        supplierId: formData.supplierId || undefined
      });

      if (result.success) {
        toast({
          title: "Movimentação registrada",
          description: `${formData.type === 'in' ? 'Entrada' : 'Saída'} de ${formData.quantity} unidades registrada com sucesso.`,
        });

        resetForm();
        onSuccess();
      } else {
        setErrors({ general: result.message });
        toast({
          title: "Erro",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('❌ Erro na submissão:', error);
      setErrors({ general: 'Erro inesperado ao registrar movimentação' });
      toast({
        title: "Erro",
        description: "Erro inesperado ao registrar movimentação",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasInsufficientStock = validationMessage !== null && formData.type === 'out';
  const canSubmit = !isSubmitting && !isLoadingStock && !hasInsufficientStock && !isValidating;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Registrar Movimentação de Estoque</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Alertas de Status */}
          <StockLoadingAlert isLoading={isLoadingStock} />
          
          {!isLoadingStock && (
            <StockStatusAlert 
              currentStock={currentStock} 
              validationError={null} 
            />
          )}

          <ErrorAlert error={errors.general || null} />
          <ValidationAlert 
            validationMessage={validationMessage} 
            isValidating={isValidating} 
          />

          {/* Tipo de movimentação */}
          <MovementTypeSelect
            value={formData.type}
            onChange={(value) => updateField('type', value)}
            disabled={isSubmitting}
          />
          {errors.type && (
            <p className="text-sm font-medium text-destructive">{errors.type}</p>
          )}

          {/* Quantidade */}
          <QuantityInput
            value={formData.quantity}
            onChange={(value) => updateField('quantity', value)}
            type={formData.type}
            currentStock={currentStock}
            hasInsufficientStock={hasInsufficientStock}
            disabled={isSubmitting}
            error={errors.quantity}
          />

          {/* Observações */}
          <NotesInput
            value={formData.notes}
            onChange={(value) => updateField('notes', value)}
            disabled={isSubmitting}
          />

          {/* Ações */}
          <FormActions
            onCancel={onCancel}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            isValidating={isValidating}
            hasInsufficientStock={hasInsufficientStock}
            hasSubmitted={false}
          />
        </form>
      </CardContent>
    </Card>
  );
};
