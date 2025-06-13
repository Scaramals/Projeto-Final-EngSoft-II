
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
import { AutoCurrencyInput } from "@/components/ui/auto-currency-input";

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
  const suppliersHook = useSuppliers();
  const { data: suppliers = [] } = suppliersHook.useAllSuppliers();
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    type: 'in' as 'in' | 'out',
    quantity: '',
    price: 0,
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
    const quantityValue = parseInt(formData.quantity) || 0;
    if (formData.type === 'out' && quantityValue > 0 && quantityValue > currentStock) {
      setValidationMessage(`Estoque insuficiente. Disponível: ${currentStock}, Solicitado: ${quantityValue}`);
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

  // Manipulador de quantidade melhorado
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Permite apenas números ou string vazia
    if (value === '' || /^\d+$/.test(value)) {
      updateField('quantity', value);
    }
  };

  // Validar formulário
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    const quantityValue = parseInt(formData.quantity) || 0;

    // Validar quantidade
    if (!formData.quantity || quantityValue <= 0) {
      newErrors.quantity = 'Quantidade deve ser maior que zero';
    }

    // Validar preço
    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Preço deve ser maior que zero';
    }

    // NOVA VALIDAÇÃO: Fornecedor obrigatório para TODAS as movimentações
    if (!formData.supplierId) {
      newErrors.supplierId = 'Fornecedor é obrigatório para todas as movimentações';
    }

    // Validar estoque para saídas
    if (formData.type === 'out' && quantityValue > currentStock) {
      newErrors.quantity = `Quantidade não pode exceder o estoque (${currentStock})`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submeter formulário - COM LOGS DETALHADOS
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log(`🔥 [FORM] === INÍCIO SUBMIT ===`);
    console.log(`🔥 [FORM] Dados do formulário:`, formData);
    console.log(`🔥 [FORM] isLoading atual:`, isLoading);
    console.log(`🔥 [FORM] Timestamp:`, new Date().toISOString());

    if (isLoading) {
      console.log('🚫 [FORM] Submissão bloqueada - já em andamento');
      return;
    }

    if (!validateForm()) {
      console.log('❌ [FORM] Validação falhou:', errors);
      toast({
        title: "Erro de validação",
        description: "Corrija os campos marcados em vermelho",
        variant: "destructive",
      });
      return;
    }

    // Verificar se há erro de validação
    if (validationMessage) {
      console.log('❌ [FORM] Validação em tempo real falhou:', validationMessage);
      toast({
        title: "Erro de validação",
        description: validationMessage,
        variant: "destructive",
      });
      return;
    }

    console.log('🚀 [FORM] Iniciando submissão...');
    setIsLoading(true);

    try {
      const quantityValue = parseInt(formData.quantity) || 0;
      
      // APENAS CRIAR A MOVIMENTAÇÃO - O TRIGGER CUIDA DO RESTO
      const result = await StockService.createMovement({
        productId,
        quantity: quantityValue,
        type: formData.type,
        notes: formData.notes.trim() || undefined,
        supplierId: formData.supplierId
      });

      console.log('📊 [FORM] Resultado da criação:', result);

      if (result.success) {
        console.log('✅ [FORM] Movimentação criada com sucesso');
        toast({
          title: "Sucesso",
          description: `${formData.type === 'in' ? 'Entrada' : 'Saída'} registrada com sucesso`,
        });
        
        // Reset form
        setFormData({
          type: 'in',
          quantity: '',
          price: 0,
          notes: '',
          supplierId: ''
        });
        
        console.log('🔥 [FORM] === FIM SUBMIT (SUCESSO) ===');
        onSuccess();
      } else {
        console.log('❌ [FORM] Erro na criação:', result.message);
        toast({
          title: "Erro",
          description: result.message || "Erro ao registrar movimentação",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ [FORM] Erro na submissão:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao processar solicitação",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      console.log('🔥 [FORM] === FIM SUBMIT ===');
    }
  };

  const quantityValue = parseInt(formData.quantity) || 0;
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

          {/* Quantidade melhorada */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Quantidade</label>
            <Input
              type="text"
              value={formData.quantity}
              onChange={handleQuantityChange}
              disabled={isLoading}
              className={errors.quantity ? "border-destructive" : ""}
              placeholder="Digite a quantidade..."
            />
            {errors.quantity && (
              <p className="text-sm text-destructive">{errors.quantity}</p>
            )}
          </div>

          {/* Preço elegante */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Preço unitário <span className="text-red-500">*</span>
            </label>
            <AutoCurrencyInput
              value={formData.price}
              onChange={(value) => updateField('price', value)}
              placeholder="R$ 0,00"
              disabled={isLoading}
            />
            {errors.price && (
              <p className="text-sm text-destructive">{errors.price}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Preço por unidade para esta movimentação
            </p>
          </div>

          {/* Fornecedor (SEMPRE obrigatório agora) */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Fornecedor <span className="text-red-500">*</span>
            </label>
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
