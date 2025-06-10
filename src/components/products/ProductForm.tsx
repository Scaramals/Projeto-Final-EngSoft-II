
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ProductFormData } from "@/types";
import { CategorySelect } from "@/components/products/CategorySelect";
import { ImageUpload } from "@/components/products/ImageUpload";
import { PriceField } from "@/components/products/PriceField";
import { QuantityField } from "@/components/inventory/forms/QuantityField";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  productNameSchema, 
  currencySchema, 
  quantitySchema 
} from "@/utils/validators";
import { AlertCircle, Loader2 } from "lucide-react";

const productFormSchema = z.object({
  name: productNameSchema,
  description: z.string().optional(),
  quantity: quantitySchema,
  price: currencySchema,
  categoryId: z.string().optional(),
  minimumStock: quantitySchema.optional(),
  imageUrl: z.string().optional(),
});

interface ProductFormProps {
  defaultValues?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [submitError, setSubmitError] = useState("");

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      quantity: 0,
      price: 0,
      categoryId: "",
      minimumStock: 5,
      imageUrl: "",
      ...defaultValues,
    },
  });

  const handleSubmit = async (data: ProductFormData) => {
    try {
      setSubmitError("");
      
      if (!data.name?.trim()) {
        setSubmitError("Nome do produto é obrigatório");
        return;
      }

      if (data.price <= 0) {
        setSubmitError("Preço deve ser maior que zero");
        return;
      }

      if (data.quantity < 0) {
        setSubmitError("Quantidade não pode ser negativa");
        return;
      }

      const cleanData = {
        ...data,
        name: data.name.trim(),
        description: data.description?.trim() || "",
        minimumStock: data.minimumStock || 0,
      };

      await onSubmit(cleanData);
    } catch (error) {
      setSubmitError("Erro ao salvar produto. Tente novamente.");
    }
  };

  const clearError = () => setSubmitError("");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {submitError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do produto*</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Digite o nome do produto"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        clearError();
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <FormControl>
                    <CategorySelect 
                      value={field.value || ''} 
                      onChange={(value) => {
                        field.onChange(value);
                        clearError();
                      }} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <QuantityField
                control={form.control}
                name="quantity"
                label="Quantidade"
                required
              />

              <QuantityField
                control={form.control}
                name="minimumStock"
                label="Estoque mínimo"
                placeholder="Ex: 5 (recomendado)"
              />
            </div>

            <PriceField
              control={form.control}
              name="price"
              required
              onErrorClear={clearError}
            />
          </div>

          <div className="space-y-6">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o produto"
                      className="h-32 resize-none"
                      maxLength={500}
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        clearError();
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Imagem do produto</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value}
                      onChange={(url) => {
                        field.onChange(url);
                        clearError();
                      }}
                      onRemove={() => {
                        field.onChange('');
                        clearError();
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="min-w-[120px]"
          >
            {isLoading ? (
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
    </Form>
  );
};
