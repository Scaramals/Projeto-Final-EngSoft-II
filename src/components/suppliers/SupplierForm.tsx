
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SupplierFormData } from '@/types';

const supplierSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  contactName: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional()
});

interface SupplierFormProps {
  defaultValues?: Partial<SupplierFormData>;
  onSubmit: (data: SupplierFormData) => void;
  isLoading?: boolean;
}

const SupplierForm: React.FC<SupplierFormProps> = ({ 
  defaultValues = {}, 
  onSubmit,
  isLoading = false
}) => {
  const form = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: '',
      contactName: '',
      email: '',
      phone: '',
      address: '',
      notes: '',
      ...defaultValues
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm sm:text-base">Nome do Fornecedor*</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Digite o nome do fornecedor" 
                  className="text-sm sm:text-base" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="contactName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm sm:text-base">Nome do Contato</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Nome da pessoa de contato" 
                    className="text-sm sm:text-base" 
                    {...field} 
                  />
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
                <FormLabel className="text-sm sm:text-base">Email</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Email de contato" 
                    type="email" 
                    className="text-sm sm:text-base" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm sm:text-base">Telefone</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Telefone de contato" 
                    className="text-sm sm:text-base" 
                    {...field} 
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
                <FormLabel className="text-sm sm:text-base">Endereço</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Endereço do fornecedor" 
                    className="text-sm sm:text-base" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm sm:text-base">Observações</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Observações ou informações adicionais" 
                  className="text-sm sm:text-base resize-none" 
                  {...field} 
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full text-sm sm:text-base py-2 sm:py-3" 
          disabled={isLoading}
        >
          {isLoading ? 'Salvando...' : 'Salvar Fornecedor'}
        </Button>
      </form>
    </Form>
  );
};

export default SupplierForm;
