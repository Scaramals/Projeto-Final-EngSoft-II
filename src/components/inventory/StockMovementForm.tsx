
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
  
  const { data: currentProduct } = useProduct(productId);
  const realTimeStock = currentProduct?.quantity ?? 0;
  
  const { data: suppliers = [] } = useAllSuppliers();
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

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

  const hasInsufficientStock = watchType === 'out' && watchQuantity > realTimeStock;

  console.log('📊 [FORM] Estoque atual:', realTimeStock, 'Quantidade solicitada:', watchQuantity);

  // Reset supplier when changing to 'out'
  React.useEffect(() => {
    if (watchType === 'out') {
      form.setValue('supplierId', '');
    }
  }, [watchType, form]);

  // Validação visual para feedback imediato
  React.useEffect(() => {
    if (watchType === 'out' && watchQuantity > realTimeStock) {
      form.setError('quantity', {
        type: 'manual',
        message: `Quantidade solicitada (${watchQuantity}) é maior que o estoque disponível (${realTimeStock})`
      });
    } else {
      form.clearErrors('quantity');
    }
  }, [watchType, watchQuantity, realTimeStock, form]);

  const handleSubmit = async (values: StockMovementFormValues) => {
    console.log('🚀 [FORM] Iniciando submissão:', values);
    
    // Prevenir submissões duplas
    if (isSubmitting || isLoading) {
      console.log('⚠️ [FORM] Submissão já em andamento, ignorando');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Validação final do estoque
      const validation = await StockValidationService.validateMovement(
        productId, 
        values.quantity, 
        values.type
      );
      
      if (!validation.valid) {
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
      
      console.log('✅ [FORM] Enviando movimentação validada:', movement);
      
      addStockMovement(movement, {
        onSuccess: (data) => {
          console.log('✅ [FORM] Movimentação registrada com sucesso:', data);
          setIsSubmitting(false);
          onSubmit();
        },
        onError: (error: any) => {
          console.error('❌ [FORM] Erro:', error);
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
                currentStock={realTimeStock}
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
