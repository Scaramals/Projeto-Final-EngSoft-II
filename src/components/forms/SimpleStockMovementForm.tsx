
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { useSimpleForm } from "@/hooks/useSimpleForm";

interface SimpleStockMovementFormProps {
  productId: string;
  onSubmit: (data: { productId: string; quantity: number; type: 'in' | 'out'; notes?: string }) => Promise<void>;
  onCancel: () => void;
  currentStock: number;
  isLoading?: boolean;
}

export const SimpleStockMovementForm: React.FC<SimpleStockMovementFormProps> = ({
  productId,
  onSubmit,
  onCancel,
  currentStock,
  isLoading = false,
}) => {
  const {
    values,
    errors,
    isSubmitting,
    getFieldProps,
    handleSubmit,
    setValue,
  } = useSimpleForm({
    initialValues: {
      type: 'in',
      quantity: 1,
      notes: '',
    },
    validate: (values) => {
      const errors: Record<string, string> = {};
      
      if (!values.type) {
        errors.type = "Tipo de movimentação é obrigatório";
      }
      
      if (!values.quantity || Number(values.quantity) <= 0) {
        errors.quantity = "Quantidade deve ser maior que zero";
      }
      
      if (values.type === 'out' && Number(values.quantity) > currentStock) {
        errors.quantity = `Quantidade não pode ser maior que o estoque disponível (${currentStock})`;
      }
      
      return errors;
    },
    onSubmit: async (values) => {
      await onSubmit({
        productId,
        quantity: Number(values.quantity),
        type: values.type as 'in' | 'out',
        notes: String(values.notes).trim() || undefined,
      });
    },
  });

  const handleTypeChange = (type: string) => {
    setValue('type', type);
  };

  const isOutOfStock = values.type === 'out' && Number(values.quantity) > currentStock;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Registrar Movimentação de Estoque</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Estoque atual: <strong>{currentStock} unidades</strong>
            </AlertDescription>
          </Alert>

          {isOutOfStock && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Quantidade solicitada é maior que o estoque disponível!
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo de movimentação</label>
            <Select
              value={String(values.type)}
              onValueChange={handleTypeChange}
              disabled={isSubmitting || isLoading}
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

          <div className="space-y-2">
            <label className="text-sm font-medium">Quantidade</label>
            <Input
              type="number"
              min="1"
              step="1"
              placeholder="Digite a quantidade"
              {...getFieldProps('quantity')}
              disabled={isSubmitting || isLoading}
              className={isOutOfStock ? "border-yellow-500" : ""}
            />
            {values.type === "out" && (
              <p className={`text-sm ${isOutOfStock ? "text-yellow-600" : "text-muted-foreground"}`}>
                Estoque disponível: {currentStock} unidades
                {isOutOfStock && " - ATENÇÃO: Quantidade maior que estoque!"}
              </p>
            )}
            {errors.quantity && (
              <p className="text-sm font-medium text-destructive">{errors.quantity}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Observações (opcional)</label>
            <Textarea
              placeholder="Adicione observações sobre esta movimentação..."
              {...getFieldProps('notes')}
              disabled={isSubmitting || isLoading}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting || isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isLoading || isOutOfStock}
              className="flex-1"
            >
              {(isSubmitting || isLoading) ? (
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
