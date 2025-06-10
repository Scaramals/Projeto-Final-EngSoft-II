
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "../ui/input";

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
  const { useAddStockMovement } = useProducts();
  const { useAllSuppliers } = useSuppliers();
  const { mutate: addStockMovement, isPending: isLoading } = useAddStockMovement();
  
  const { data: suppliers = [] } = useAllSuppliers();
  const formRef = useRef<HTMLFormElement>(null);

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

  // Validação rigorosa de estoque insuficiente
  const hasInsufficientStock = watchType === 'out' && watchQuantity > currentStock;
  const isStockEmpty = currentStock === 0;

  // Reset supplier when changing to 'out'
  React.useEffect(() => {
    if (watchType === 'out') {
      form.setValue('supplierId', '');
    }
  }, [watchType, form]);

  // Validação em tempo real da quantidade para saídas
  React.useEffect(() => {
    if (watchType === 'out' && watchQuantity > currentStock) {
      form.setError('quantity', {
        type: 'manual',
        message: `Quantidade não pode ser maior que o estoque disponível (${currentStock})`
      });
    } else {
      form.clearErrors('quantity');
    }
  }, [watchType, watchQuantity, currentStock, form]);

  const handleSubmit = (values: StockMovementFormValues) => {
    console.log('Validando movimentação com regras rigorosas:', values);
    
    // VALIDAÇÃO RIGOROSA - Impedir qualquer saída maior que estoque
    if (values.type === 'out') {
      if (currentStock === 0) {
        toast({
          variant: "destructive",
          title: "Produto sem estoque",
          description: "Não é possível registrar saída para produto sem estoque disponível",
        });
        form.setError('quantity', {
          type: 'manual',
          message: 'Produto sem estoque disponível'
        });
        return;
      }
      
      if (values.quantity > currentStock) {
        toast({
          variant: "destructive",
          title: "Estoque insuficiente",
          description: `ERRO: Tentativa de saída de ${values.quantity} unidades quando há apenas ${currentStock} em estoque. Operação bloqueada.`,
        });
        form.setError('quantity', {
          type: 'manual',
          message: `Máximo permitido: ${currentStock} unidades`
        });
        return;
      }

      if (values.quantity <= 0) {
        toast({
          variant: "destructive",
          title: "Quantidade inválida",
          description: "A quantidade deve ser maior que zero",
        });
        return;
      }
    }
    
    const movement: Partial<StockMovement> = {
      ...values,
      productId,
      supplierId: values.type === 'out' ? undefined : values.supplierId,
    };
    
    console.log('Enviando movimentação validada:', movement);
    
    addStockMovement(movement, {
      onSuccess: (data) => {
        console.log('Movimentação registrada com sucesso:', data);
        toast({
          title: "Movimentação registrada",
          description: `${values.type === 'in' ? 'Entrada' : 'Saída'} de ${values.quantity} unidades registrada com sucesso!`,
        });
        onSubmit();
      },
      onError: (error: any) => {
        console.error('Erro ao registrar movimentação:', error);
        toast({
          variant: "destructive",
          title: "Erro ao registrar movimentação",
          description: error.message || "Ocorreu um erro inesperado. Verifique os dados e tente novamente.",
        });
      }
    });
  };

  // Determinar se o formulário deve estar desabilitado
  const isFormDisabled = isLoading || (watchType === 'out' && (isStockEmpty || hasInsufficientStock));

  return (
    <Form {...form}>
      <form ref={formRef} onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de movimentação</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="in">Entrada</SelectItem>
                    <SelectItem value="out" disabled={isStockEmpty}>
                      Saída {isStockEmpty && "(Sem estoque)"}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantidade</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    max={watchType === 'out' ? currentStock : undefined}
                    step="1"
                    disabled={isLoading || (watchType === 'out' && isStockEmpty)}
                    {...field}
                    className={hasInsufficientStock || (watchType === 'out' && isStockEmpty) ? "border-red-500" : ""}
                  />
                </FormControl>
                {watchType === "out" && (
                  <FormDescription className={isStockEmpty ? "text-red-600 font-medium" : ""}>
                    Estoque disponível: {currentStock} unidades
                    {isStockEmpty && " - BLOQUEADO: Produto sem estoque!"}
                    {!isStockEmpty && hasInsufficientStock && " - ERRO: Quantidade excede estoque!"}
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
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
                    disabled={isLoading}
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
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isFormDisabled}
            variant={watchType === "in" ? "default" : "destructive"}
            className={isFormDisabled && watchType === "out" ? "opacity-50 cursor-not-allowed" : ""}
          >
            {isLoading
              ? "Processando..."
              : isStockEmpty && watchType === "out"
              ? "Bloqueado - Sem estoque"
              : hasInsufficientStock && watchType === "out"
              ? "Bloqueado - Estoque insuficiente"
              : watchType === "in"
              ? "Registrar entrada"
              : "Registrar saída"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
