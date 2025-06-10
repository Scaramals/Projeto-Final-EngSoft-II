
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
import { useSuppliers } from "@/hooks/useSuppliers";

interface SimplifiedStockFormProps {
  productId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const SimplifiedStockForm: React.FC<SimplifiedStockFormProps> = ({
  productId,
  onSuccess,
  onCancel
}) => {
  const { toast } = useToast();
  const { suppliers } = useSuppliers();
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    type: 'in' as 'in' | 'out',
    quantity: 1,
    notes: '',
    supplierId: ''
  });
  
  // Estados de controle
  const [currentStock, setCurrentStock] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStock, setIsLoadingStock] = useState(true);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Carregar estoque atual apenas uma vez
  useEffect(() => {
    const loadStock = async () => {
      try {
        const stock = await StockService.getCurrentStock(productId);
        setCurrentStock(stock);
      } catch (error) {
        console.error('Erro ao carregar estoque:', error);
      } finally {
        setIsLoadingStock(false);
      }
    };

    loadStock();
  }, [productId]);

  // Validação em tempo real para saídas
  useEffect(() => {
    if (formData.type === 'out' && formData.quantity > 0 && formData.quantity > currentStock) {
      setValidationMessage(`Estoque insuficiente. Disponível: ${currentStock}, Solicitado: ${formData.quantity}`);
    } else {
      setValidationMessage(null);
    }
  }, [formData.type, formData.quantity, currentStock]);

  // Atualizar campo do formulário
  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validar formulário
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    // Validar quantidade
    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = 'Quantidade deve ser maior que zero';
    }

    // Validar fornecedor para entradas
    if (formData.type === 'in' && !formData.supplierId) {
      newErrors.supplierId = 'Fornecedor é obrigatório para entradas';
    }

    // Validar estoque para saídas
    if (formData.type === 'out' && formData.quantity > currentStock) {
      newErrors.quantity = `Quantidade não pode exceder o estoque (${currentStock})`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submeter formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoading) return;

    if (!validateForm()) {
      toast({
        title: "Erro de validação",
        description: "Corrija os campos marcados em vermelho",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await StockService.createMovement({
        productId,
        quantity: formData.quantity,
        type: formData.type,
        notes: formData.notes.trim() || undefined,
        supplierId: formData.type === 'in' ? formData.supplierId : undefined
      });

      if (result.success) {
        toast({
          title: "Sucesso",
          description: `${formData.type === 'in' ? 'Entrada' : 'Saída'} registrada com sucesso`,
        });
        
        // Reset form
        setFormData({
          type: 'in',
          quantity: 1,
          notes: '',
          supplierId: ''
        });
        
        onSuccess();
      } else {
        toast({
          title: "Erro",
          description: result.message || "Erro ao registrar movimentação",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao processar solicitação",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const canSubmit = !isLoading && !isLoadingStock && !validationMessage;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Nova Movimentação</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status do estoque */}
        {isLoadingStock ? (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>Carregando...</AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>Estoque: {currentStock} unidades</AlertDescription>
          </Alert>
        )}

        {/* Alerta de validação */}
        {validationMessage && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{validationMessage}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo</label>
            <Select
              value={formData.type}
              onValueChange={(value: 'in' | 'out') => updateField('type', value)}
              disabled={isLoading}
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
            <label className="text-sm font-medium">Quantidade</label>
            <Input
              type="number"
              min="1"
              value={formData.quantity || ''}
              onChange={(e) => updateField('quantity', parseInt(e.target.value) || 0)}
              disabled={isLoading}
              className={errors.quantity ? "border-destructive" : ""}
            />
            {errors.quantity && (
              <p className="text-sm text-destructive">{errors.quantity}</p>
            )}
          </div>

          {/* Fornecedor (obrigatório para entradas) */}
          {formData.type === 'in' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Fornecedor *</label>
              <Select
                value={formData.supplierId}
                onValueChange={(value) => updateField('supplierId', value)}
                disabled={isLoading}
              >
                <SelectTrigger className={errors.supplierId ? "border-destructive" : ""}>
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
              {errors.supplierId && (
                <p className="text-sm text-destructive">{errors.supplierId}</p>
              )}
            </div>
          )}

          {/* Observações */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Observações</label>
            <Textarea
              value={formData.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              disabled={isLoading}
              placeholder="Observações opcionais..."
              className="min-h-[60px]"
            />
          </div>

          {/* Ações */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processando...
                </>
              ) : (
                "Registrar"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
