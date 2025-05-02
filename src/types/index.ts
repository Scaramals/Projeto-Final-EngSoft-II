
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
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
  quantity: number;
  type: 'in' | 'out';
  date: string;
  notes?: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface DashboardStats {
  totalProducts: number;
  lowStockProducts: number;
  totalValue: number;
  recentMovements: StockMovement[];
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
