
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CnpjInput } from "@/components/ui/cnpj-input";
import { PhoneInput } from "@/components/ui/phone-input";
import { CepInput } from "@/components/ui/cep-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { SupplierFormData } from "@/types";

interface SupplierFormProps {
  defaultValues?: Partial<SupplierFormData>;
  onSubmit: (data: SupplierFormData) => Promise<void>;
  isLoading?: boolean;
}

const SupplierForm: React.FC<SupplierFormProps> = ({
  defaultValues,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<SupplierFormData>({
    name: defaultValues?.name || "",
    cnpj: defaultValues?.cnpj || "",
    contactName: defaultValues?.contactName || "",
    email: defaultValues?.email || "",
    phone: defaultValues?.phone || "",
    address: defaultValues?.address || "",
    city: defaultValues?.city || "",
    state: defaultValues?.state || "",
    zipCode: defaultValues?.zipCode || "",
    notes: defaultValues?.notes || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Nome da empresa é obrigatório";
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email deve ter um formato válido";
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
      console.error('Erro ao salvar fornecedor:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof SupplierFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome da Empresa*</label>
            <Input
              placeholder="Ex: Distribuidora ABC Ltda"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
            {errors.name && (
              <p className="text-sm font-medium text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">CNPJ</label>
            <CnpjInput
              value={formData.cnpj || ""}
              onChange={(value) => handleChange('cnpj', value)}
              placeholder="00.000.000/0000-00"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Nome do Contato</label>
            <Input
              placeholder="Ex: João Silva"
              value={formData.contactName || ""}
              onChange={(e) => handleChange('contactName', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              placeholder="contato@empresa.com.br"
              value={formData.email || ""}
              onChange={(e) => handleChange('email', e.target.value)}
            />
            {errors.email && (
              <p className="text-sm font-medium text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Telefone</label>
            <PhoneInput
              value={formData.phone || ""}
              onChange={(value) => handleChange('phone', value)}
              placeholder="(11) 99999-9999"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Endereço</label>
            <Input
              placeholder="Rua das Flores, 123 - Centro"
              value={formData.address || ""}
              onChange={(e) => handleChange('address', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cidade</label>
              <Input
                placeholder="São Paulo"
                value={formData.city || ""}
                onChange={(e) => handleChange('city', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Estado</label>
              <Input
                placeholder="SP"
                maxLength={2}
                value={formData.state || ""}
                onChange={(e) => handleChange('state', e.target.value.toUpperCase())}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">CEP</label>
            <CepInput
              value={formData.zipCode || ""}
              onChange={(value) => handleChange('zipCode', value)}
              placeholder="00000-000"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Observações</label>
            <Textarea
              placeholder="Informações adicionais sobre o fornecedor, condições comerciais, etc."
              value={formData.notes || ""}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="min-h-[80px] resize-none"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t">
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
            "Salvar fornecedor"
          )}
        </Button>
      </div>
    </form>
  );
};

export default SupplierForm;
