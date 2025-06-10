
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Product, StockMovement, Supplier, Category } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface DataContextType {
  // Products
  products: Product[];
  loadingProducts: boolean;
  fetchProducts: () => Promise<void>;
  createProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  
  // Stock Movements
  stockMovements: StockMovement[];
  loadingMovements: boolean;
  fetchStockMovements: () => Promise<void>;
  createStockMovement: (movement: Omit<StockMovement, 'id' | 'date' | 'createdBy' | 'updatedAt'>) => Promise<void>;
  
  // Suppliers
  suppliers: Supplier[];
  loadingSuppliers: boolean;
  fetchSuppliers: () => Promise<void>;
  createSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  
  // Categories
  categories: Category[];
  loadingCategories: boolean;
  fetchCategories: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [loadingMovements, setLoadingMovements] = useState(false);
  
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Products functions
  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar produtos",
        variant: "destructive",
      });
    } finally {
      setLoadingProducts(false);
    }
  }, [toast]);

  const createProduct = useCallback(async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();
      
      if (error) throw error;
      
      setProducts(prev => [...prev, data]);
      toast({
        title: "Sucesso",
        description: "Produto criado com sucesso",
      });
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar produto",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  const updateProduct = useCallback(async (id: string, productData: Partial<Product>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      setProducts(prev => prev.map(p => p.id === id ? data : p));
      toast({
        title: "Sucesso",
        description: "Produto atualizado com sucesso",
      });
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar produto",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  const deleteProduct = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setProducts(prev => prev.filter(p => p.id !== id));
      toast({
        title: "Sucesso",
        description: "Produto excluído com sucesso",
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir produto",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  // Stock Movements functions
  const fetchStockMovements = useCallback(async () => {
    setLoadingMovements(true);
    try {
      const { data, error } = await supabase
        .from('stock_movements')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      setStockMovements(data || []);
    } catch (error) {
      console.error('Error fetching stock movements:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar movimentações",
        variant: "destructive",
      });
    } finally {
      setLoadingMovements(false);
    }
  }, [toast]);

  const createStockMovement = useCallback(async (movementData: Omit<StockMovement, 'id' | 'date' | 'createdBy' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('stock_movements')
        .insert({
          ...movementData,
          date: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setStockMovements(prev => [data, ...prev]);
      await fetchProducts(); // Refresh products to update quantities
      
      toast({
        title: "Sucesso",
        description: "Movimentação registrada com sucesso",
      });
    } catch (error) {
      console.error('Error creating stock movement:', error);
      toast({
        title: "Erro",
        description: "Erro ao registrar movimentação",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast, fetchProducts]);

  // Suppliers functions
  const fetchSuppliers = useCallback(async () => {
    setLoadingSuppliers(true);
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setSuppliers(data || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar fornecedores",
        variant: "destructive",
      });
    } finally {
      setLoadingSuppliers(false);
    }
  }, [toast]);

  const createSupplier = useCallback(async (supplierData: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .insert(supplierData)
        .select()
        .single();
      
      if (error) throw error;
      
      setSuppliers(prev => [...prev, data]);
      toast({
        title: "Sucesso",
        description: "Fornecedor criado com sucesso",
      });
    } catch (error) {
      console.error('Error creating supplier:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar fornecedor",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  // Categories functions
  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar categorias",
        variant: "destructive",
      });
    } finally {
      setLoadingCategories(false);
    }
  }, [toast]);

  const value: DataContextType = {
    products,
    loadingProducts,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    
    stockMovements,
    loadingMovements,
    fetchStockMovements,
    createStockMovement,
    
    suppliers,
    loadingSuppliers,
    fetchSuppliers,
    createSupplier,
    
    categories,
    loadingCategories,
    fetchCategories,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
