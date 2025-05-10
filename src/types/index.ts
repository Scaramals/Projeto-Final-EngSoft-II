
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee' | 'developer';
}

export interface Profile {
  id: string;
  fullName: string | null;
  role: 'admin' | 'employee' | 'developer';
  createdAt: string;
  updatedAt: string;
  is_master?: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  category?: string;
  imageUrl?: string;
  minimumStock?: number;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName?: string; // Nome do produto para exibição
  quantity: number;
  type: 'in' | 'out';
  date: string;
  notes?: string;
  userId?: string;
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
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface DashboardStats {
  totalProducts: number;
  lowStockProducts: number;
  totalValue: number;
  recentMovementsCount: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
    borderWidth?: number;
  }[];
}

export interface FilterParams {
  search?: string;
  category?: string;
  sortBy?: 'name' | 'quantity' | 'price';
  sortDirection?: 'asc' | 'desc';
}

// Tipos para formulários
export interface ProductFormData {
  name: string;
  description?: string;
  quantity: number;
  price: number;
  category?: string;
  minimumStock?: number;
  imageUrl?: string;
}

export interface StockMovementFormData {
  type: 'in' | 'out';
  quantity: number;
  notes?: string;
  productId: string;
}

export interface SupplierFormData {
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export interface CategoryFormData {
  name: string;
  description?: string;
}
