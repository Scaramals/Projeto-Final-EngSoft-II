
import { useState, useEffect } from "react";
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
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch all suppliers
  const fetchSuppliers = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name');
        
      if (error) {
        throw new Error(`Error fetching suppliers: ${error.message}`);
      }
      
      const mappedSuppliers = data.map(mapDbSupplierToSupplier) as Supplier[];
      setSuppliers(mappedSuppliers);
    } catch (err: any) {
      setError(err);
      SecureLogger.error('Erro ao buscar fornecedores', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load suppliers when user is available
  useEffect(() => {
    if (user) {
      fetchSuppliers();
    }
  }, [user]);

  const useAllSuppliers = () => {
    return {
      data: suppliers,
      isLoading,
      error,
      refetch: fetchSuppliers
    };
  };

  // Fetch a single supplier by ID
  const useSupplier = (supplierId: string | undefined) => {
    const [supplier, setSupplier] = useState<Supplier | null>(null);
    const [loading, setLoading] = useState(false);
    const [fetchError, setFetchError] = useState<Error | null>(null);

    useEffect(() => {
      if (!user || !supplierId) return;

      const fetchSupplier = async () => {
        setLoading(true);
        setFetchError(null);
        
        try {
          const { data, error } = await supabase
            .from('suppliers')
            .select('*')
            .eq('id', supplierId)
            .single();
            
          if (error) {
            throw new Error(`Error fetching supplier: ${error.message}`);
          }
          
          setSupplier(mapDbSupplierToSupplier(data));
        } catch (err: any) {
          setFetchError(err);
          SecureLogger.error('Erro ao buscar fornecedor', err);
        } finally {
          setLoading(false);
        }
      };

      fetchSupplier();
    }, [user, supplierId]);

    return {
      data: supplier,
      isLoading: loading,
      error: fetchError
    };
  };

  // Create a new supplier
  const useCreateSupplier = () => {
    const [isCreating, setIsCreating] = useState(false);

    return {
      mutateAsync: async (supplier: Partial<Supplier>) => {
        setIsCreating(true);
        try {
          SecureLogger.info('Criando novo fornecedor');
          
          // Validação obrigatória no frontend
          if (!supplier.name || supplier.name.trim() === '') {
            throw new Error('Nome do fornecedor é obrigatório');
          }
          
          if (!supplier.cnpj || supplier.cnpj.trim() === '') {
            throw new Error('CNPJ é obrigatório');
          }
          
          // Limpar campos vazios antes de enviar
          const cleanedSupplier = {
            ...supplier,
            name: supplier.name.trim(),
            cnpj: supplier.cnpj.trim(),
            contactName: supplier.contactName && supplier.contactName.trim() !== '' ? supplier.contactName.trim() : null,
            email: supplier.email && supplier.email.trim() !== '' ? supplier.email.trim() : null,
            phone: supplier.phone && supplier.phone.trim() !== '' ? supplier.phone.trim() : null,
            address: supplier.address && supplier.address.trim() !== '' ? supplier.address.trim() : null,
            notes: supplier.notes && supplier.notes.trim() !== '' ? supplier.notes.trim() : null
          };
          
          console.log('📝 [SUPPLIER_HOOK] Dados limpos para inserção:', cleanedSupplier);
          
          const dbSupplier = mapSupplierToDbSupplier(cleanedSupplier, user?.id);
          
          const { data, error } = await supabase
            .from('suppliers')
            .insert(dbSupplier)
            .select()
            .single();
            
          if (error) {
            console.error('❌ [SUPPLIER_HOOK] Erro detalhado:', error);
            
            if (error.code === '23505' && error.message.includes('suppliers_cnpj_key')) {
              throw new Error('Este CNPJ já está cadastrado para outro fornecedor');
            }
            
            SecureLogger.error('Erro ao criar fornecedor', error);
            throw new Error(`Erro ao criar fornecedor: ${error.message}`);
          }
          
          SecureLogger.success('Fornecedor criado com sucesso');
          
          // Refresh suppliers list
          await fetchSuppliers();
          
          toast.success("Fornecedor criado com sucesso!");
          
          return mapDbSupplierToSupplier(data);
        } catch (error: any) {
          console.error('❌ [SUPPLIER_HOOK] Erro na criação do fornecedor:', error);
          SecureLogger.error('Erro na criação do fornecedor', error);
          toast.error(error.message || 'Erro ao criar fornecedor');
          throw error;
        } finally {
          setIsCreating(false);
        }
      },
      isPending: isCreating,
      isLoading: isCreating
    };
  };

  // Update an existing supplier
  const useUpdateSupplier = () => {
    const [isUpdating, setIsUpdating] = useState(false);

    return {
      mutateAsync: async ({ id, ...updates }: Partial<Supplier> & { id: string }) => {
        setIsUpdating(true);
        try {
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
          
          // Refresh suppliers list
          await fetchSuppliers();
          
          toast.success("Fornecedor atualizado com sucesso!");
          
          return mapDbSupplierToSupplier(data);
        } catch (error: any) {
          SecureLogger.error('Erro na atualização do fornecedor', error);
          toast.error(`Erro ao atualizar fornecedor: ${error.message}`);
          throw error;
        } finally {
          setIsUpdating(false);
        }
      },
      isPending: isUpdating,
      isLoading: isUpdating
    };
  };

  // Delete a supplier
  const useDeleteSupplier = () => {
    const [isDeleting, setIsDeleting] = useState(false);

    return {
      mutateAsync: async (id: string) => {
        setIsDeleting(true);
        try {
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
          
          // Refresh suppliers list
          await fetchSuppliers();
          
          toast.success("Fornecedor excluído com sucesso!");
          
          return id;
        } catch (error: any) {
          SecureLogger.error('Erro na exclusão do fornecedor', error);
          toast.error(`Erro ao excluir fornecedor: ${error.message}`);
          throw error;
        } finally {
          setIsDeleting(false);
        }
      },
      isPending: isDeleting,
      isLoading: isDeleting
    };
  };

  return {
    useAllSuppliers,
    useSupplier,
    useCreateSupplier,
    useUpdateSupplier,
    useDeleteSupplier
  };
}
