
import React, { useState } from "react";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import * as z from "zod";

interface ProductFormProps {
  initialData?: Partial<Product>;
  onSubmit: (data: Partial<Product>) => void;
  onCancel: () => void;
  isLoading: boolean;
}

// Schema for product validation
const productSchema = z.object({
  name: z.string().min(3, "O nome do produto deve ter pelo menos 3 caracteres").max(100),
  description: z.string().optional(),
  quantity: z.coerce.number().int().min(0, "A quantidade não pode ser negativa"),
  price: z.coerce.number().min(0, "O preço deve ser maior ou igual a zero").refine(
    (val) => !isNaN(val) && Number.isFinite(val),
    "O preço deve ser um número válido"
  ),
  category: z.string().optional(),
  minimumStock: z.coerce.number().int().min(0, "O estoque mínimo não pode ser negativo"),
  imageUrl: z.string().url("URL inválida").optional().or(z.literal(''))
});

type ProductFormValues = z.infer<typeof productSchema>;

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData = {},
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const { toast } = useToast();

  // Set default values for the form
  const defaultValues: ProductFormValues = {
    name: initialData.name || "",
    description: initialData.description || "",
    quantity: initialData.quantity || 0,
    price: initialData.price || 0,
    category: initialData.category || "",
    minimumStock: initialData.minimumStock || 5,
    imageUrl: initialData.imageUrl || "",
  };

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues,
    mode: "onChange"
  });

  const handleFormSubmit = (values: ProductFormValues) => {
    // Clean up empty values
    const formattedValues = {
      ...values,
      imageUrl: values.imageUrl || undefined,
      category: values.category || undefined,
      description: values.description || undefined,
    };
    
    onSubmit(formattedValues);
  };

  // Format price as currency
  const formatPrice = (value: string) => {
    // Remove non-numeric characters
    const numericValue = value.replace(/[^0-9.,]/g, "");
    // Replace comma with dot for decimal
    const normalizedValue = numericValue.replace(",", ".");
    
    return normalizedValue;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do produto *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Nome do produto" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Categoria do produto" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={3} placeholder="Descrição detalhada do produto" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="price"
            render={({ field: { onChange, ...rest } }) => (
              <FormItem>
                <FormLabel>Preço (R$)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    onChange={e => {
                      const formattedValue = formatPrice(e.target.value);
                      onChange(formattedValue);
                    }}
                    {...rest}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantidade em estoque</FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    min="0"
                    step="1" 
                    placeholder="0"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="minimumStock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estoque mínimo</FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    min="0"
                    step="1" 
                    placeholder="5"
                    {...field}
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
                <FormLabel>URL da imagem</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="https://..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading || !form.formState.isValid}>
            {isLoading ? "Salvando..." : "Salvar produto"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
