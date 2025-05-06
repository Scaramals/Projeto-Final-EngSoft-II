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
  productName?: string; // Added product name for display
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

// Form types
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
