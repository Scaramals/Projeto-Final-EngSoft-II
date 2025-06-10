
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useStockMovements } from "@/hooks/useStockMovements";
import { useToast } from "@/components/ui/use-toast";
import { StockValidationService } from "@/services/stockValidationService";
import { MovementTypeField } from "./MovementTypeField";
import { QuantityField } from "./QuantityField";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle } from "lucide-react";

const formSchema = z.object({
  type: z.enum(["in", "out"], {
    required_error: "Selecione o tipo de movimentação",
  }),
  quantity: z.number().min(1, "Quantidade deve ser maior que 0"),
  notes: z.string().optional(),
  supplierId: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

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

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "in",
      quantity: 1,
      notes: "",
      supplierId: "",
    },
  });

  const { useCreateStockMovement } = useStockMovements();
  const createMovementMutation = useCreateStockMovement();

  const watchedType = form.watch("type");
  const watchedQuantity = form.watch("quantity");

  // Validação em tempo real quando mudar tipo ou quantidade
  useEffect(() => {
    const validateMovement = async () => {
      if (!watchedType || !watchedQuantity || watchedQuantity <= 0) {
        setValidationError(null);
        return;
      }

      console.log('🔍 [FORM] === VALIDAÇÃO EM TEMPO REAL ===');
      console.log('🔍 [FORM] Tipo:', watchedType);
      console.log('🔍 [FORM] Quantidade:', watchedQuantity);
      console.log('🔍 [FORM] Produto ID:', productId);

      if (watchedType === 'out') {
        setIsValidating(true);
        try {
          const validation = await StockValidationService.validateMovement(
            productId, 
            watchedQuantity, 
            watchedType
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
  }, [watchedType, watchedQuantity, productId, currentStock]);

  const handleSubmit = async (data: FormData) => {
    // Evitar duplo envio
    if (isSubmitting || hasSubmitted) {
      console.log('🚫 [FORM] Bloqueando duplo envio');
      return;
    }

    console.log('🎯 [FORM] === INICIANDO ENVIO ===');
    console.log('🎯 [FORM] Dados do formulário:', data);
    console.log('🎯 [FORM] Produto ID:', productId);

    setIsSubmitting(true);
    setHasSubmitted(true);

    try {
      // Validação final antes do envio
      if (data.type === 'out') {
        console.log('🔍 [FORM] Validação final antes do envio...');
        const finalValidation = await StockValidationService.validateMovement(
          productId,
          data.quantity,
          data.type
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
        quantity: data.quantity,
        type: data.type,
        notes: data.notes || "",
        supplierId: data.supplierId || null,
      });

      console.log('✅ [FORM] Movimentação registrada com sucesso!');
      
      toast({
        title: "Sucesso!",
        description: `${data.type === 'in' ? 'Entrada' : 'Saída'} de ${data.quantity} unidades registrada.`,
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

  const hasInsufficientStock = validationError !== null && watchedType === 'out';

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Registrar Movimentação de Estoque</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Alerta de estoque atual */}
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Estoque atual: <strong>{currentValidatedStock} unidades</strong>
              </AlertDescription>
            </Alert>

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <MovementTypeField 
                  field={field} 
                  isLoading={isSubmitting || isValidating}
                />
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <QuantityField
                  field={field}
                  movementType={watchedType}
                  currentStock={currentValidatedStock}
                  isLoading={isSubmitting || isValidating}
                  hasInsufficientStock={hasInsufficientStock}
                />
              )}
            />

            {/* Alerta de erro de validação */}
            {validationError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {validationError}
                </AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Observações (opcional)</label>
                  <Textarea
                    placeholder="Adicione observações sobre esta movimentação..."
                    disabled={isSubmitting || isValidating}
                    {...field}
                  />
                </div>
              )}
            />

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isValidating || hasInsufficientStock || hasSubmitted}
                className="flex-1"
              >
                {isSubmitting ? "Registrando..." : 
                 isValidating ? "Validando..." :
                 hasSubmitted ? "Registrado" :
                 "Registrar Movimentação"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
