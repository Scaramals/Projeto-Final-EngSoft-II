
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StockService } from "@/services/stockService";
import { useStockForm } from "@/hooks/useStockForm";

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
          {/* Status do estoque */}
          {isLoadingStock ? (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>Carregando estoque atual...</AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Estoque atual: <strong>{currentStock} unidades</strong>
              </AlertDescription>
            </Alert>
          )}

          {/* Alertas de erro */}
          {errors.general && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}

          {validationMessage && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{validationMessage}</AlertDescription>
            </Alert>
          )}

          {/* Tipo de movimentação */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo de movimentação</label>
            <Select
              value={formData.type}
              onValueChange={(value: 'in' | 'out') => updateField('type', value)}
              disabled={isSubmitting}
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
              value={formData.quantity || ''}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                if (!isNaN(value) && value >= 0) {
                  updateField('quantity', value);
                }
              }}
              disabled={isSubmitting}
              className={hasInsufficientStock ? "border-red-500" : ""}
              placeholder="Digite a quantidade"
            />
            {formData.type === "out" && (
              <p className={`text-sm ${hasInsufficientStock ? "text-red-600" : "text-muted-foreground"}`}>
                Estoque disponível: {currentStock} unidades
                {isValidating && (
                  <span className="ml-2">
                    <Loader2 className="h-3 w-3 animate-spin inline" />
                  </span>
                )}
              </p>
            )}
            {errors.quantity && (
              <p className="text-sm font-medium text-destructive">{errors.quantity}</p>
            )}
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Observações (opcional)</label>
            <Textarea
              value={formData.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              disabled={isSubmitting}
              placeholder="Adicione observações sobre esta movimentação..."
            />
          </div>

          {/* Ações */}
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
              disabled={!canSubmit}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Registrando...
                </>
              ) : (
                "Registrar Movimentação"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
