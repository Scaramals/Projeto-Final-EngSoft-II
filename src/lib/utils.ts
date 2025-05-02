
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function generateMockId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function getStockStatus(quantity: number, minimumStock: number = 10) {
  if (quantity <= 0) return { label: 'Sem estoque', class: 'status-low' };
  if (quantity <= minimumStock / 2) return { label: 'Crítico', class: 'status-low' };
  if (quantity <= minimumStock) return { label: 'Baixo', class: 'status-medium' };
  return { label: 'Adequado', class: 'status-good' };
}

// Mock data for development
export function generateMockProducts(count: number = 10): any[] {
  const categories = ['Eletrônicos', 'Alimentos', 'Escritório', 'Limpeza', 'Roupas'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: generateMockId(),
    name: `Produto ${i + 1}`,
    description: `Descrição detalhada do produto ${i + 1} contendo suas especificações.`,
    quantity: Math.floor(Math.random() * 50),
    price: parseFloat((Math.random() * 1000 + 10).toFixed(2)),
    category: categories[Math.floor(Math.random() * categories.length)],
    minimumStock: 5,
    createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
    updatedAt: new Date().toISOString(),
  }));
}

export function generateMockStockMovements(count: number = 10): any[] {
  const products = generateMockProducts(5);
  
  return Array.from({ length: count }, (_, i) => ({
    id: generateMockId(),
    productId: products[Math.floor(Math.random() * products.length)].id,
    quantity: Math.floor(Math.random() * 10) + 1,
    type: Math.random() > 0.5 ? 'in' : 'out',
    date: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
    notes: Math.random() > 0.3 ? `Observação para movimentação ${i + 1}` : undefined,
  }));
}

export function generateMockDashboardStats(): any {
  const products = generateMockProducts(20);
  const lowStockProducts = products.filter(p => p.quantity <= p.minimumStock);
  
  return {
    totalProducts: products.length,
    lowStockProducts: lowStockProducts.length,
    totalValue: products.reduce((sum, product) => sum + product.price * product.quantity, 0),
    recentMovements: generateMockStockMovements(5),
  };
}
