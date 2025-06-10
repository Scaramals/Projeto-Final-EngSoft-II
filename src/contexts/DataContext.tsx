
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

// Helper functions to convert between database and app formats
const convertProductFromDB = (dbProduct: any): Product => ({
  id: dbProduct.id,
  name: dbProduct.name,
  description: dbProduct.description,
  quantity: dbProduct.quantity,
  price: dbProduct.price,
  categoryId: dbProduct.category_id,
  imageUrl: dbProduct.image_url,
  minimumStock: dbProduct.minimum_stock,
  createdAt: dbProduct.created_at,
  updatedAt: dbProduct.updated_at,
  createdBy: dbProduct.created_by,
  lastModifiedBy: dbProduct.last_modified_by,
});

const convertStockMovementFromDB = (dbMovement: any): StockMovement => ({
  id: dbMovement.id,
  productId: dbMovement.product_id,
  quantity: dbMovement.quantity,
  type: dbMovement.type as 'in' | 'out',
  date: dbMovement.date,
  supplierId: dbMovement.supplier_id,
  supplierName: dbMovement.supplier_name,
  productName: dbMovement.product_name,
  notes: dbMovement.notes,
  userId: dbMovement.user_id,
  createdBy: dbMovement.created_by,
  updatedAt: dbMovement.updated_at,
});

const convertSupplierFromDB = (dbSupplier: any): Supplier => ({
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

const convertCategoryFromDB = (dbCategory: any): Category => ({
  id: dbCategory.id,
  name: dbCategory.name,
  description: dbCategory.description,
  createdAt: dbCategory.created_at,
});

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
      const convertedProducts = (data || []).map(convertProductFromDB);
      setProducts(convertedProducts);
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
        .insert({
          name: productData.name,
          description: productData.description,
          quantity: productData.quantity,
          price: productData.price,
          category_id: productData.categoryId,
          image_url: productData.imageUrl,
          minimum_stock: productData.minimumStock,
          created_by: productData.createdBy,
          last_modified_by: productData.lastModifiedBy,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      const convertedProduct = convertProductFromDB(data);
      setProducts(prev => [...prev, convertedProduct]);
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
      const updateData: any = {};
      if (productData.name !== undefined) updateData.name = productData.name;
      if (productData.description !== undefined) updateData.description = productData.description;
      if (productData.quantity !== undefined) updateData.quantity = productData.quantity;
      if (productData.price !== undefined) updateData.price = productData.price;
      if (productData.categoryId !== undefined) updateData.category_id = productData.categoryId;
      if (productData.imageUrl !== undefined) updateData.image_url = productData.imageUrl;
      if (productData.minimumStock !== undefined) updateData.minimum_stock = productData.minimumStock;
      if (productData.lastModifiedBy !== undefined) updateData.last_modified_by = productData.lastModifiedBy;

      const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      const convertedProduct = convertProductFromDB(data);
      setProducts(prev => prev.map(p => p.id === id ? convertedProduct : p));
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
      const convertedMovements = (data || []).map(convertStockMovementFromDB);
      setStockMovements(convertedMovements);
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
          product_id: movementData.productId,
          quantity: movementData.quantity,
          type: movementData.type,
          date: new Date().toISOString(),
          supplier_id: movementData.supplierId,
          notes: movementData.notes,
          user_id: movementData.userId,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      const convertedMovement = convertStockMovementFromDB(data);
      setStockMovements(prev => [convertedMovement, ...prev]);
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
      const convertedSuppliers = (data || []).map(convertSupplierFromDB);
      setSuppliers(convertedSuppliers);
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
        .insert({
          name: supplierData.name,
          cnpj: supplierData.cnpj,
          contact_name: supplierData.contactName,
          email: supplierData.email,
          phone: supplierData.phone,
          address: supplierData.address,
          notes: supplierData.notes,
          created_by: supplierData.createdBy,
          last_modified_by: supplierData.lastModifiedBy,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      const convertedSupplier = convertSupplierFromDB(data);
      setSuppliers(prev => [...prev, convertedSupplier]);
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
      const convertedCategories = (data || []).map(convertCategoryFromDB);
      setCategories(convertedCategories);
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
