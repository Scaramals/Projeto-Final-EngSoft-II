
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Supplier, SupplierFormData } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Helper function to convert database response to Supplier type
 */
const mapDbSupplierToSupplier = (dbSupplier: any): Supplier => ({
  id: dbSupplier.id,
  name: dbSupplier.name,
  contactName: dbSupplier.contact_name,
  email: dbSupplier.email,
  phone: dbSupplier.phone,
  address: dbSupplier.address,
  notes: dbSupplier.notes,
  createdAt: dbSupplier.created_at,
  updatedAt: dbSupplier.updated_at,
  createdBy: dbSupplier.created_by,
});

/**
 * Helper function to convert Supplier type to database format
 */
const mapSupplierToDbSupplier = (supplier: SupplierFormData, userId?: string) => {
  const dbSupplier: any = {};
  
  if (supplier.name !== undefined) dbSupplier.name = supplier.name;
  if (supplier.contactName !== undefined) dbSupplier.contact_name = supplier.contactName;
  if (supplier.email !== undefined) dbSupplier.email = supplier.email;
  if (supplier.phone !== undefined) dbSupplier.phone = supplier.phone;
  if (supplier.address !== undefined) dbSupplier.address = supplier.address;
  if (supplier.notes !== undefined) dbSupplier.notes = supplier.notes;
  if (userId) dbSupplier.created_by = userId;
  
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
        let query = supabase.from('suppliers').select('*');

        if (search) {
          query = query.ilike('name', `%${search}%`);
        }
        
        query = query.order('name');
        
        const { data, error } = await query;

        if (error) {
          console.error('Error fetching suppliers:', error);
          throw new Error(`Error fetching suppliers: ${error.message}`);
        }

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
        if (!supplierId) throw new Error("Supplier ID is required");
        
        const { data, error } = await supabase
          .from('suppliers')
          .select('*')
          .eq('id', supplierId)
          .single();
          
        if (error) {
          console.error('Error fetching supplier:', error);
          throw new Error(`Error fetching supplier: ${error.message}`);
        }
        
        return mapDbSupplierToSupplier(data);
      },
      enabled: !!user && !!supplierId,
    });
  };

  // Criar um novo fornecedor - CORRIGIDO: removido referência à tabela users
  const useCreateSupplier = () => {
    return useMutation({
      mutationFn: async (supplier: SupplierFormData) => {
        if (!user) {
          throw new Error("User not authenticated");
        }

        console.log('Creating supplier with user ID:', user.id);
        // Não incluir user ID para evitar erro de permissão
        const dbSupplier = mapSupplierToDbSupplier(supplier);
        
        console.log('Supplier data to insert:', dbSupplier);
        
        const { data, error } = await supabase
          .from('suppliers')
          .insert(dbSupplier)
          .select()
          .single();
          
        if (error) {
          console.error('Error creating supplier:', error);
          throw new Error(`Error creating supplier: ${error.message}`);
        }
        
        return mapDbSupplierToSupplier(data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['suppliers'] });
        toast({
          title: "Fornecedor criado",
          description: "O fornecedor foi criado com sucesso!",
        });
      },
      onError: (error) => {
        console.error('Mutation error:', error);
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
        const dbUpdates = mapSupplierToDbSupplier(updates as SupplierFormData);
        
        const { data, error } = await supabase
          .from('suppliers')
          .update(dbUpdates)
          .eq('id', id)
          .select()
          .single();
          
        if (error) {
          console.error('Error updating supplier:', error);
          throw new Error(`Error updating supplier: ${error.message}`);
        }
        
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
      onError: (error) => {
        console.error('Update error:', error);
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
        const { error } = await supabase
          .from('suppliers')
          .delete()
          .eq('id', id);
          
        if (error) {
          console.error('Error deleting supplier:', error);
          throw new Error(`Error deleting supplier: ${error.message}`);
        }
        
        return id;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['suppliers'] });
        toast({
          title: "Fornecedor excluído",
          description: "O fornecedor foi removido com sucesso!",
        });
      },
      onError: (error) => {
        console.error('Delete error:', error);
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
