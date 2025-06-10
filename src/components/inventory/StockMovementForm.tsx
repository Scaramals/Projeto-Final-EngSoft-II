
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StockMovement } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { useProducts } from "@/hooks/useProducts";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useStockMovements } from "@/hooks/useStockMovements";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { MovementTypeField } from "./MovementTypeField";
import { QuantityField } from "./QuantityField";
import { StockValidationService } from "@/services/stockValidationService";

interface StockMovementFormProps {
  productId: string;
  onSubmit: () => void;
  onCancel: () => void;
  currentStock?: number;
}

const stockMovementSchema = z.object({
  type: z.enum(['in', 'out'], {
    required_error: "Selecione o tipo de movimentação",
  }),
  quantity: z.coerce.number().int().positive("A quantidade deve ser maior que zero"),
  notes: z.string().optional(),
  supplierId: z.string().optional(),
}).refine((data) => {
  if (data.type === 'in' && (!data.supplierId || data.supplierId === "")) {
    return false;
  }
  return true;
}, {
  message: "Fornecedor é obrigatório para entradas de estoque",
  path: ["supplierId"],
});

type StockMovementFormValues = z.infer<typeof stockMovementSchema>;

export const StockMovementForm: React.FC<StockMovementFormProps> = ({
  productId,
  onSubmit,
  onCancel,
  currentStock = 0,
}) => {
  const { toast } = useToast();
  const { useProduct } = useProducts();
  const { useAllSuppliers } = useSuppliers();
  const { useAddStockMovement } = useStockMovements();
  const { mutate: addStockMovement, isPending: isLoading } = useAddStockMovement();
  
  // SEMPRE buscar produto DIRETO do banco com configuração agressiva
  const { data: currentProduct, refetch: refetchProduct } = useProduct(productId);
  const bankStock = currentProduct?.quantity ?? 0;
  
  const { data: suppliers = [] } = useAllSuppliers();
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  console.log('🔍 [FORM] === ESTADO ATUAL DO FORMULÁRIO ===');
  console.log('🔍 [FORM] Product ID:', productId);
  console.log('🔍 [FORM] Current Stock (prop):', currentStock);
  console.log('🔍 [FORM] Bank Stock (query):', bankStock);
  console.log('🔍 [FORM] Produto completo:', currentProduct);
  console.log('🔍 [FORM] Timestamp:', new Date().toISOString());

  const form = useForm<StockMovementFormValues>({
    resolver: zodResolver(stockMovementSchema),
    defaultValues: {
      type: 'in',
      quantity: 1,
      notes: '',
      supplierId: '',
    },
  });

  const watchType = form.watch('type');
  const watchQuantity = form.watch('quantity');

  // Usar SEMPRE o estoque do banco como fonte da verdade
  const realStock = bankStock;
  const hasInsufficientStock = watchType === 'out' && watchQuantity > realStock;

  console.log('📊 [FORM] === ANÁLISE DE ESTOQUE ===');
  console.log('📊 [FORM] Estoque REAL:', realStock);
  console.log('📊 [FORM] Tipo movimento:', watchType);
  console.log('📊 [FORM] Quantidade solicitada:', watchQuantity);
  console.log('📊 [FORM] Tem estoque insuficiente?', hasInsufficientStock);

  // Reset supplier when changing to 'out'
  React.useEffect(() => {
    if (watchType === 'out') {
      form.setValue('supplierId', '');
    }
  }, [watchType, form]);

  // Refresh product data when form opens
  React.useEffect(() => {
    console.log('🔄 [FORM] Forçando refresh dos dados do produto...');
    refetchProduct();
  }, [refetchProduct]);

  // Validação visual para feedback imediato
  React.useEffect(() => {
    if (watchType === 'out' && watchQuantity > realStock) {
      console.log(`⚠️ [FORM] VALIDAÇÃO VISUAL FALHOU: ${watchQuantity} > ${realStock}`);
      form.setError('quantity', {
        type: 'manual',
        message: `Quantidade solicitada (${watchQuantity}) é maior que o estoque disponível (${realStock})`
      });
    } else {
      form.clearErrors('quantity');
    }
  }, [watchType, watchQuantity, realStock, form]);

  const handleSubmit = async (values: StockMovementFormValues) => {
    console.log('🚀 [FORM] === INICIANDO SUBMISSÃO DO FORMULÁRIO ===');
    console.log('🚀 [FORM] Valores do formulário:', values);
    console.log('🚀 [FORM] Estoque real antes da submissão:', realStock);
    console.log('🚀 [FORM] Product ID:', productId);
    console.log('🚀 [FORM] Timestamp:', new Date().toISOString());
    
    // Prevenir submissões duplas
    if (isSubmitting || isLoading) {
      console.log('⚠️ [FORM] Submissão já em andamento, ignorando');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // VALIDAÇÃO FINAL com dados frescos do banco
      console.log('🔍 [FORM] === EXECUTANDO VALIDAÇÃO FINAL ===');
      const validation = await StockValidationService.validateMovement(
        productId, 
        values.quantity, 
        values.type
      );
      
      console.log('📋 [FORM] Resultado da validação:', validation);
      
      if (!validation.valid) {
        console.error('❌ [FORM] VALIDAÇÃO FALHOU:', validation.message);
        toast({
          variant: "destructive",
          title: "Movimentação bloqueada",
          description: validation.message,
        });
        setIsSubmitting(false);
        return;
      }
      
      const movement: Partial<StockMovement> = {
        ...values,
        productId,
        supplierId: values.type === 'out' ? undefined : values.supplierId,
      };
      
      console.log('✅ [FORM] === ENVIANDO MOVIMENTAÇÃO VALIDADA ===');
      console.log('✅ [FORM] Dados do movimento:', movement);
      
      addStockMovement(movement, {
        onSuccess: async (data) => {
          console.log('✅ [FORM] === SUCESSO NO FORMULÁRIO ===');
          console.log('✅ [FORM] Dados retornados:', data);
          setIsSubmitting(false);
          
          // Aguardar um tempo para garantir que o trigger terminou
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Forçar refresh dos dados antes de chamar onSubmit
          await refetchProduct();
          
          onSubmit();
        },
        onError: (error: any) => {
          console.error('❌ [FORM] === ERRO NO FORMULÁRIO ===');
          console.error('❌ [FORM] Erro completo:', error);
          setIsSubmitting(false);
        }
      });
    } catch (error) {
      console.error('❌ [FORM] Erro na validação:', error);
      setIsSubmitting(false);
      toast({
        variant: "destructive",
        title: "Erro na validação",
        description: "Ocorreu um erro ao validar a movimentação",
      });
    }
  };

  return (
    <Form {...form}>
      <form ref={formRef} onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <MovementTypeField field={field} isLoading={isLoading || isSubmitting} />
            )}
          />
          
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <QuantityField 
                field={field}
                movementType={watchType}
                currentStock={realStock}
                isLoading={isLoading || isSubmitting}
                hasInsufficientStock={hasInsufficientStock}
              />
            )}
          />

          {watchType === 'in' && (
            <FormField
              control={form.control}
              name="supplierId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fornecedor *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                    disabled={isLoading || isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o fornecedor (obrigatório)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name} {supplier.cnpj && `- ${supplier.cnpj}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    O fornecedor é obrigatório para entradas de estoque
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Informe detalhes sobre esta movimentação"
                    rows={3}
                    disabled={isLoading || isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading || isSubmitting}>
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isLoading || isSubmitting}
            variant={watchType === "in" ? "default" : "destructive"}
          >
            {isLoading || isSubmitting
              ? "Processando..."
              : watchType === "in"
              ? "Registrar entrada"
              : "Registrar saída"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
