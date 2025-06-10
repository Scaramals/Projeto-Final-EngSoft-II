
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStockMovements } from "@/hooks/useStockMovements";
import { useToast } from "@/hooks/use-toast";
import { StockValidationService } from "@/services/stockValidationService";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle } from "lucide-react";

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
  const [errors, setErrors] = useState<{
    type?: string;
    quantity?: string;
    notes?: string;
  }>({});

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

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!type) {
      newErrors.type = 'Selecione o tipo de movimentação';
    }

    if (!quantity || quantity <= 0) {
      newErrors.quantity = 'Quantidade deve ser maior que 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Evitar duplo envio
    if (isSubmitting || hasSubmitted) {
      console.log('🚫 [FORM] Bloqueando duplo envio');
      return;
    }

    if (!validateForm()) {
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
          {/* Alerta de estoque atual */}
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Estoque atual: <strong>{currentValidatedStock} unidades</strong>
            </AlertDescription>
          </Alert>

          {/* Tipo de movimentação */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo de movimentação</label>
            <Select
              value={type}
              onValueChange={(value: 'in' | 'out') => {
                console.log('🔄 [TYPE] Tipo selecionado:', value);
                setType(value);
              }}
              disabled={isSubmitting || isValidating}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in">Entrada</SelectItem>
                <SelectItem value="out">Saída</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm font-medium text-destructive">{errors.type}</p>
            )}
          </div>

          {/* Quantidade */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Quantidade</label>
            <Input
              type="number"
              min="1"
              step="1"
              value={quantity}
              disabled={isSubmitting || isValidating}
              className={hasInsufficientStock ? "border-yellow-500" : ""}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0;
                console.log('📝 [QUANTITY] Valor digitado:', value);
                setQuantity(value);
              }}
            />
            {type === "out" && (
              <p className={`text-sm ${hasInsufficientStock ? "text-yellow-600" : "text-muted-foreground"}`}>
                Estoque disponível: {currentValidatedStock} unidades
                {hasInsufficientStock && " - ATENÇÃO: Quantidade maior que estoque!"}
              </p>
            )}
            {errors.quantity && (
              <p className="text-sm font-medium text-destructive">{errors.quantity}</p>
            )}
          </div>

          {/* Alerta de erro de validação */}
          {validationError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {validationError}
              </AlertDescription>
            </Alert>
          )}

          {/* Observações */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Observações (opcional)</label>
            <Textarea
              placeholder="Adicione observações sobre esta movimentação..."
              value={notes}
              disabled={isSubmitting || isValidating}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

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
      </CardContent>
    </Card>
  );
};
