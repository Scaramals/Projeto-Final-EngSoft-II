
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AutoCurrencyInput } from "@/components/ui/auto-currency-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { useSimpleForm } from "@/hooks/useSimpleForm";
import { ProductFormData } from "@/types";

interface SimpleProductFormProps {
  defaultValues?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const SimpleProductForm: React.FC<SimpleProductFormProps> = ({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const {
    values,
    errors,
    hasErrors,
    isSubmitting,
    getFieldProps,
    handleSubmit,
    setValue,
  } = useSimpleForm({
    initialValues: {
      name: defaultValues?.name || "",
      description: defaultValues?.description || "",
      quantity: defaultValues?.quantity || 0,
      price: defaultValues?.price || 0,
      categoryId: defaultValues?.categoryId || "",
      minimumStock: defaultValues?.minimumStock || 5,
      imageUrl: defaultValues?.imageUrl || "",
    },
    validate: (values) => {
      const errors: Record<string, string> = {};
      
      if (!values.name || String(values.name).trim() === "") {
        errors.name = "Nome do produto é obrigatório";
      }
      
      if (Number(values.price) <= 0) {
        errors.price = "Preço deve ser maior que zero";
      }
      
      if (Number(values.quantity) < 0) {
        errors.quantity = "Quantidade não pode ser negativa";
      }
      
      return errors;
    },
    onSubmit: async (values) => {
      const productData: ProductFormData = {
        name: String(values.name).trim(),
        description: String(values.description).trim(),
        quantity: Number(values.quantity),
        price: Number(values.price),
        categoryId: String(values.categoryId) || undefined,
        minimumStock: Number(values.minimumStock) || 0,
        imageUrl: String(values.imageUrl) || undefined,
      };
      
      await onSubmit(productData);
    },
  });

  const handlePriceChange = (price: number) => {
    setValue('price', price);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {hasErrors && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Por favor, corrija os erros abaixo antes de continuar.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome do produto*</label>
            <Input
              placeholder="Digite o nome do produto"
              {...getFieldProps('name')}
            />
            {errors.name && (
              <p className="text-sm font-medium text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Quantidade*</label>
              <Input
                type="number"
                min="0"
                placeholder="Ex: 10"
                {...getFieldProps('quantity')}
              />
              {errors.quantity && (
                <p className="text-sm font-medium text-destructive">{errors.quantity}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Estoque mínimo</label>
              <Input
                type="number"
                min="0"
                placeholder="Ex: 5"
                {...getFieldProps('minimumStock')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Preço*</label>
            <AutoCurrencyInput
              value={Number(values.price)}
              onChange={handlePriceChange}
            />
            {errors.price && (
              <p className="text-sm font-medium text-destructive">{errors.price}</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Descrição</label>
            <Textarea
              placeholder="Descreva o produto"
              className="h-32 resize-none"
              maxLength={500}
              {...getFieldProps('description')}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">URL da imagem</label>
            <Input
              placeholder="https://exemplo.com/imagem.jpg"
              {...getFieldProps('imageUrl')}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting || isLoading}
        >
          Cancelar
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting || isLoading}
          className="min-w-[120px]"
        >
          {(isSubmitting || isLoading) ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Salvando...
            </>
          ) : (
            "Salvar produto"
          )}
        </Button>
      </div>
    </form>
  );
};
