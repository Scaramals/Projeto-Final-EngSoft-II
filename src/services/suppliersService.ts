
import { supabase } from "@/integrations/supabase/client";
import { Supplier } from "@/types";
import { cacheService } from "./cacheService";

/**
 * Serviço para operações relacionadas a fornecedores
 */
export const SuppliersService = {
  /**
   * Obter todos os fornecedores
   */
  async getAllSuppliers(): Promise<Supplier[]> {
    try {
      const cacheKey = 'all_suppliers';
      const cachedSuppliers = cacheService.get<Supplier[]>(cacheKey);
      
      if (cachedSuppliers) {
        console.log('Using cached suppliers');
        return cachedSuppliers;
      }

      console.log('Fetching suppliers from database');
      const { data, error } = await supabase
        .from('suppliers')
        .select('*');
      
      if (error) {
        console.error('Error fetching suppliers:', error);
        throw error;
      }

      const suppliers = (data || []).map((supplier) => ({
        id: supplier.id,
        name: supplier.name,
        cnpj: supplier.cnpj,
        contactName: supplier.contact_name,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address,
        notes: supplier.notes,
        createdAt: supplier.created_at,
        updatedAt: supplier.updated_at,
        createdBy: supplier.created_by,
        lastModifiedBy: supplier.last_modified_by,
      })) as Supplier[];

      console.log('Suppliers fetched:', suppliers.length);
      
      // Cache por 10 minutos
      cacheService.set(cacheKey, suppliers, 600);
      
      return suppliers;
    } catch (error) {
      console.error("Erro ao buscar fornecedores:", error);
      throw error;
    }
  }
};
