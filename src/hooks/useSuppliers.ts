
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Supplier, SupplierFormData } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { SecureLogger } from "@/services/secureLogger";

/**
 * Helper function to convert database response to Supplier type
 */
const mapDbSupplierToSupplier = (dbSupplier: any): Supplier => ({
  id: dbSupplier.id,
  name: dbSupplier.name,
  cnpj: dbSupplier.cnpj,
  contactName: dbSupplier.contact_name,
  email: dbSupplier.email,
  phone: dbSupplier.phone,
  address: dbSupplier.address,
  notes: dbSupplier.notes,
  createdAt: dbSupplier.created_at,
  updatedAt: dbSupplier.updated_at,
  createdBy: dbSupplier.created_by,
  lastModifiedBy: dbSupplier.last_modified_by,
});

/**
 * Helper function to convert Supplier type to database format
 */
const mapSupplierToDbSupplier = (supplier: SupplierFormData, userId?: string) => {
  const dbSupplier: any = {};
  
  if (supplier.name !== undefined) dbSupplier.name = supplier.name;
  if (supplier.cnpj !== undefined) dbSupplier.cnpj = supplier.cnpj;
  if (supplier.contactName !== undefined) dbSupplier.contact_name = supplier.contactName;
  if (supplier.email !== undefined) dbSupplier.email = supplier.email;
  if (supplier.phone !== undefined) dbSupplier.phone = supplier.phone;
  if (supplier.address !== undefined) dbSupplier.address = supplier.address;
  if (supplier.notes !== undefined) dbSupplier.notes = supplier.notes;
  
  if (userId) {
    dbSupplier.created_by = userId;
    dbSupplier.last_modified_by = userId;
  }
  
  return dbSupplier;
};

export function useSuppliers() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch all suppliers
  const useAllSuppliers = (search?: string) => {
    return useQuery({
      queryKey: ['suppliers', search],
      queryFn: async () => {
        SecureLogger.info('Buscando fornecedores da API');
        
        let query = supabase.from('suppliers').select('*');

        if (search) {
          query = query.or(`name.ilike.%${search}%,cnpj.ilike.%${search}%`);
        }
        
        query = query.order('name');
        
        const { data, error } = await query;

        if (error) {
          SecureLogger.error('Erro ao buscar fornecedores', error);
          throw new Error(`Erro ao buscar fornecedores: ${error.message}`);
        }

        SecureLogger.success(`Fornecedores encontrados: ${data?.length || 0}`);
        return (data || []).map(mapDbSupplierToSupplier) as Supplier[];
      },
      enabled: !!user,
    });
  };

  // Buscar um fornecedor pelo ID
  const useSupplier = (supplierId: string | undefined) => {
    return useQuery({
      queryKey: ['suppliers', supplierId],
      queryFn: async () => {
        if (!supplierId) throw new Error("ID do fornecedor é obrigatório");
        
        SecureLogger.info('Buscando fornecedor específico');
        
        const { data, error } = await supabase
          .from('suppliers')
          .select('*')
          .eq('id', supplierId)
          .single();
          
        if (error) {
          SecureLogger.error('Erro ao buscar fornecedor', error);
          throw new Error(`Erro ao buscar fornecedor: ${error.message}`);
        }
        
        return mapDbSupplierToSupplier(data);
      },
      enabled: !!user && !!supplierId,
    });
  };

  // Criar um novo fornecedor
  const useCreateSupplier = () => {
    return useMutation({
      mutationFn: async (supplier: SupplierFormData) => {
        SecureLogger.info('Criando novo fornecedor');
        
        const dbSupplier = mapSupplierToDbSupplier(supplier, user?.id);
        
        const { data, error } = await supabase
          .from('suppliers')
          .insert(dbSupplier)
          .select()
          .single();
          
        if (error) {
          SecureLogger.error('Erro ao criar fornecedor', error);
          throw new Error(`Erro ao criar fornecedor: ${error.message}`);
        }
        
        SecureLogger.success('Fornecedor criado com sucesso');
        return mapDbSupplierToSupplier(data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['suppliers'] });
        toast({
          title: "Fornecedor criado",
          description: "O fornecedor foi criado com sucesso!",
        });
      },
      onError: (error: any) => {
        SecureLogger.error('Erro na criação do fornecedor', error);
        toast({
          variant: "destructive",
          title: "Erro ao criar fornecedor",
          description: error.message,
        });
      }
    });
  };

  // Atualizar um fornecedor existente
  const useUpdateSupplier = () => {
    return useMutation({
      mutationFn: async ({ id, ...updates }: Partial<Supplier> & { id: string }) => {
        SecureLogger.info('Atualizando fornecedor');
        
        const dbUpdates = mapSupplierToDbSupplier(updates as SupplierFormData, user?.id);
        dbUpdates.last_modified_by = user?.id;
        
        const { data, error } = await supabase
          .from('suppliers')
          .update(dbUpdates)
          .eq('id', id)
          .select()
          .single();
          
        if (error) {
          SecureLogger.error('Erro ao atualizar fornecedor', error);
          throw new Error(`Erro ao atualizar fornecedor: ${error.message}`);
        }
        
        SecureLogger.success('Fornecedor atualizado com sucesso');
        return mapDbSupplierToSupplier(data);
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['suppliers'] });
        queryClient.invalidateQueries({ queryKey: ['suppliers', variables.id] });
        toast({
          title: "Fornecedor atualizado",
          description: "As alterações foram salvas com sucesso!",
        });
      },
      onError: (error: any) => {
        SecureLogger.error('Erro na atualização do fornecedor', error);
        toast({
          variant: "destructive",
          title: "Erro ao atualizar fornecedor",
          description: error.message,
        });
      }
    });
  };

  // Excluir um fornecedor
  const useDeleteSupplier = () => {
    return useMutation({
      mutationFn: async (id: string) => {
        SecureLogger.info('Excluindo fornecedor');
        
        const { error } = await supabase
          .from('suppliers')
          .delete()
          .eq('id', id);
          
        if (error) {
          SecureLogger.error('Erro ao excluir fornecedor', error);
          throw new Error(`Erro ao excluir fornecedor: ${error.message}`);
        }
        
        SecureLogger.success('Fornecedor excluído com sucesso');
        return id;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['suppliers'] });
        toast({
          title: "Fornecedor excluído",
          description: "O fornecedor foi removido com sucesso!",
        });
      },
      onError: (error: any) => {
        SecureLogger.error('Erro na exclusão do fornecedor', error);
        toast({
          variant: "destructive",
          title: "Erro ao excluir fornecedor",
          description: error.message,
        });
      }
    });
  };

  return {
    useAllSuppliers,
    useSupplier,
    useCreateSupplier,
    useUpdateSupplier,
    useDeleteSupplier
  };
}
