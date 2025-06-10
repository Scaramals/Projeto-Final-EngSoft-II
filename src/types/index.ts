
export interface Product {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  categoryId?: string; // Mudança: agora é categoryId (UUID) em vez de category (string)
  imageUrl?: string;
  minimumStock?: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  lastModifiedBy?: string;
  suppliers?: Supplier[];
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  cnpj?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  lastModifiedBy?: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  quantity: number;
  type: 'in' | 'out';
  date: string;
  supplierId?: string;
  supplierName?: string;
  productName?: string;
  notes?: string;
  userId?: string;
  createdBy?: string;
  updatedAt: string;
}

export interface FilterParams {
  search?: string;
  categoryId?: string; // Mudança: agora é categoryId
  sortBy?: 'name' | 'price' | 'quantity' | 'created_at';
  sortDirection?: 'asc' | 'desc';
}

export interface DashboardStats {
  totalProducts: number;
  lowStockProducts: number;
  totalValue: number;
  recentMovementsCount: number;
}

export interface MovementSummary {
  movement_date: string;
  total_in: number;
  total_out: number;
  net_movement: number;
}

export interface CategoryAnalysis {
  category_name: string;
  product_count: number;
  total_quantity: number;
  total_value: number;
}

export interface Profile {
  id: string;
  full_name?: string; // Corrigido: usar full_name em vez de fullName
  role?: string;
  is_master?: boolean;
  created_at: string;
  updated_at: string;
}

export interface SupplierFormData {
  name: string;
  cnpj?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface ProductFormData {
  name: string;
  description?: string;
  quantity: number;
  price: number;
  categoryId?: string; // Corrigido: usar categoryId em vez de category
  minimumStock?: number;
  imageUrl?: string;
  suppliers?: string[];
}
