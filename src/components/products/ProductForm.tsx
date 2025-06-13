
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AutoCurrencyInput } from "@/components/ui/auto-currency-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { CategorySelector } from "./CategorySelector";
import { SimpleImageUpload } from "./SimpleImageUpload";
import { ProductFormData } from "@/types";

interface ProductFormProps {
  defaultValues?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: defaultValues?.name || "",
    description: defaultValues?.description || "",
    quantity: defaultValues?.quantity || 0,
    price: defaultValues?.price || 0,
    categoryId: defaultValues?.categoryId || "",
    minimumStock: defaultValues?.minimumStock || 0,
    imageUrl: defaultValues?.imageUrl || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Nome do produto é obrigatório";
    }
    
    if (formData.price <= 0) {
      newErrors.price = "Preço deve ser maior que zero";
    }
    
    if (formData.quantity < 0) {
      newErrors.quantity = "Quantidade não pode ser negativa";
    }

    if (formData.minimumStock < 0) {
      newErrors.minimumStock = "Estoque mínimo não pode ser negativo";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const hasErrors = Object.keys(errors).length > 0;

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Coluna esquerda - Informações básicas */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome do produto*</label>
            <Input
              placeholder="Ex: Notebook Dell Inspiron 15"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
            {errors.name && (
              <p className="text-sm font-medium text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Descrição</label>
            <Textarea
              placeholder="Descreva as características, especificações e detalhes importantes do produto"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="min-h-[100px] resize-none"
              maxLength={500}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Quantidade*</label>
              <Input
                type="number"
                min="0"
                step="1"
                placeholder="Ex: 50 unidades"
                value={formData.quantity === 0 ? '' : formData.quantity.toString()}
                onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 0)}
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
                step="1"
                placeholder="Ex: 10 unidades"
                value={formData.minimumStock === 0 ? '' : formData.minimumStock.toString()}
                onChange={(e) => handleChange('minimumStock', parseInt(e.target.value) || 0)}
              />
              {errors.minimumStock && (
                <p className="text-sm font-medium text-destructive">{errors.minimumStock}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Preço*</label>
            <AutoCurrencyInput
              value={formData.price}
              onChange={(value) => handleChange('price', value)}
              placeholder="R$ 0,00"
            />
            {errors.price && (
              <p className="text-sm font-medium text-destructive">{errors.price}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Categoria</label>
            <CategorySelector
              value={formData.categoryId}
              onChange={(value) => handleChange('categoryId', value)}
            />
          </div>
        </div>

        {/* Coluna direita - Imagem */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Imagem do produto</label>
            <SimpleImageUpload
              value={formData.imageUrl}
              onChange={(url) => handleChange('imageUrl', url)}
              onRemove={() => handleChange('imageUrl', "")}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t">
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
          disabled={isSubmitting || isLoading || hasErrors}
          className="min-w-[140px]"
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
