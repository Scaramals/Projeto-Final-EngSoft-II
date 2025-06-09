
import React from "react";
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
import { CnpjInput } from "@/components/ui/cnpj-input";
import { PhoneInput } from "@/components/ui/phone-input";
import { CepInput } from "@/components/ui/cep-input";
import { SupplierFormData } from "@/types";
import { cnpjSchema, phoneSchema, cepSchema } from "@/utils/validators";

const supplierFormSchema = z.object({
  name: z.string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome não pode exceder 100 caracteres"),
  cnpj: cnpjSchema.optional(),
  contactName: z.string()
    .min(2, "Nome do contato deve ter pelo menos 2 caracteres")
    .max(100, "Nome do contato não pode exceder 100 caracteres")
    .optional(),
  email: z.string()
    .email("Email inválido")
    .optional()
    .or(z.literal("")),
  phone: phoneSchema.optional(),
  address: z.string().max(200, "Endereço não pode exceder 200 caracteres").optional(),
  cep: cepSchema.optional(),
  notes: z.string().max(500, "Observações não podem exceder 500 caracteres").optional(),
});

interface EnhancedSupplierFormProps {
  defaultValues?: Partial<SupplierFormData>;
  onSubmit: (data: SupplierFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const EnhancedSupplierForm: React.FC<EnhancedSupplierFormProps> = ({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const form = useForm<SupplierFormData & { cep?: string }>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      name: "",
      cnpj: "",
      contactName: "",
      email: "",
      phone: "",
      address: "",
      cep: "",
      notes: "",
      ...defaultValues,
    },
  });

  const handleSubmit = (data: SupplierFormData & { cep?: string }) => {
    // Remove o CEP dos dados antes de enviar (pode ser integrado ao endereço se necessário)
    const { cep, ...supplierData } = data;
    onSubmit(supplierData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da empresa*</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o nome da empresa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cnpj"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CNPJ</FormLabel>
                  <FormControl>
                    <CnpjInput
                      value={field.value || ""}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do contato</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome da pessoa responsável" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="contato@empresa.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <PhoneInput
                      value={field.value || ""}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cep"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CEP</FormLabel>
                  <FormControl>
                    <CepInput
                      value={field.value || ""}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Endereço completo"
                      className="h-20 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Informações adicionais"
                      className="h-20 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Salvando..." : "Salvar fornecedor"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
