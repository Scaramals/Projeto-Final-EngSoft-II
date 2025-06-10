
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Supplier } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { SecureLogger } from "@/services/secureLogger";
import { toast } from "sonner";

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
const mapSupplierToDbSupplier = (supplier: Partial<Supplier>, userId?: string) => {
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
  const { user } = useAuth();

  // Fetch all suppliers
  const useAllSuppliers = () => {
    return useQuery({
      queryKey: ['suppliers'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('suppliers')
          .select('*')
          .order('name');
          
        if (error) {
          throw new Error(`Error fetching suppliers: ${error.message}`);
        }
        
        return data.map(mapDbSupplierToSupplier) as Supplier[];
      },
      enabled: !!user,
    });
  };

  // Fetch a single supplier by ID
  const useSupplier = (supplierId: string | undefined) => {
    return useQuery({
      queryKey: ['suppliers', supplierId],
      queryFn: async () => {
        if (!supplierId) throw new Error("Supplier ID is required");
        
        const { data, error } = await supabase
          .from('suppliers')
          .select('*')
          .eq('id', supplierId)
          .single();
          
        if (error) {
          throw new Error(`Error fetching supplier: ${error.message}`);
        }
        
        return mapDbSupplierToSupplier(data);
      },
      enabled: !!user && !!supplierId,
    });
  };

  // Create a new supplier
  const useCreateSupplier = () => {
    return useMutation({
      mutationFn: async (supplier: Partial<Supplier>) => {
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
      onSuccess: async () => {
        // FORÇAR invalidação e refetch completo após criação
        await queryClient.invalidateQueries({ queryKey: ['suppliers'] });
        await queryClient.refetchQueries({ queryKey: ['suppliers'] });
        
        toast.success("Fornecedor criado com sucesso!");
      },
      onError: (error: any) => {
        SecureLogger.error('Erro na criação do fornecedor', error);
        toast.error(`Erro ao criar fornecedor: ${error.message}`);
      }
    });
  };

  // Update an existing supplier
  const useUpdateSupplier = () => {
    return useMutation({
      mutationFn: async ({ id, ...updates }: Partial<Supplier> & { id: string }) => {
        SecureLogger.info('Atualizando fornecedor');
        
        const dbUpdates = mapSupplierToDbSupplier(updates, user?.id);
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
      onSuccess: async (_, variables) => {
        // FORÇAR invalidação e refetch completo após atualização
        await queryClient.invalidateQueries({ queryKey: ['suppliers'] });
        await queryClient.invalidateQueries({ queryKey: ['suppliers', variables.id] });
        
        // Refetch específico
        await queryClient.refetchQueries({ queryKey: ['suppliers'] });
        await queryClient.refetchQueries({ queryKey: ['suppliers', variables.id] });
        
        toast.success("Fornecedor atualizado com sucesso!");
      },
      onError: (error: any) => {
        SecureLogger.error('Erro na atualização do fornecedor', error);
        toast.error(`Erro ao atualizar fornecedor: ${error.message}`);
      }
    });
  };

  // Delete a supplier
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
      onSuccess: async () => {
        // FORÇAR invalidação e refetch completo após exclusão
        await queryClient.invalidateQueries({ queryKey: ['suppliers'] });
        await queryClient.refetchQueries({ queryKey: ['suppliers'] });
        
        toast.success("Fornecedor excluído com sucesso!");
      },
      onError: (error: any) => {
        SecureLogger.error('Erro na exclusão do fornecedor', error);
        toast.error(`Erro ao excluir fornecedor: ${error.message}`);
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
