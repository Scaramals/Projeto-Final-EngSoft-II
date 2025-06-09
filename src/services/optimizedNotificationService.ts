
import { supabase } from "@/integrations/supabase/client";
import { Alert } from "./alertsService";

class OptimizedNotificationService {
  private cache = new Map<string, Alert[]>();
  private cacheExpiry = new Map<string, number>();
  private readonly CACHE_DURATION = 2 * 60 * 1000; // 2 minutos

  async getAlerts(useCache: boolean = true): Promise<Alert[]> {
    const cacheKey = 'notifications';
    const now = Date.now();

    // Verificar cache
    if (useCache && this.cache.has(cacheKey)) {
      const expiry = this.cacheExpiry.get(cacheKey) || 0;
      if (now < expiry) {
        return this.cache.get(cacheKey)!;
      }
    }

    // Buscar dados frescos
    const alerts = await this.fetchFreshAlerts();
    
    // Atualizar cache
    this.cache.set(cacheKey, alerts);
    this.cacheExpiry.set(cacheKey, now + this.CACHE_DURATION);

    return alerts;
  }

  private async fetchFreshAlerts(): Promise<Alert[]> {
    const alerts: Alert[] = [];

    // Buscar produtos com estoque baixo em uma query otimizada
    const { data: lowStockProducts } = await supabase
      .from('products')
      .select('id, name, quantity, minimum_stock')
      .not('minimum_stock', 'is', null)
      .lte('quantity', supabase.rpc('minimum_stock'))
      .order('quantity', { ascending: true })
      .limit(10);

    // Adicionar alertas de estoque baixo
    if (lowStockProducts) {
      lowStockProducts.forEach(product => {
        alerts.push({
          id: `low-stock-${product.id}`,
          type: 'low_stock',
          severity: product.quantity === 0 ? 'critical' : 'high',
          title: 'Estoque Baixo',
          message: `${product.name} possui apenas ${product.quantity} unidades (mínimo: ${product.minimum_stock})`,
          isRead: false,
          createdAt: new Date().toISOString(),
        });
      });
    }

    // Buscar movimentações recentes de alto valor
    const { data: highValueMovements } = await supabase
      .from('stock_movements')
      .select(`
        id,
        quantity,
        type,
        date,
        products!inner(name, price)
      `)
      .gte('date', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Últimas 24h
      .order('date', { ascending: false })
      .limit(5);

    // Adicionar alertas de movimentações de alto valor
    if (highValueMovements) {
      highValueMovements.forEach(movement => {
        const value = movement.quantity * (movement.products as any).price;
        if (value > 1000) {
          alerts.push({
            id: `high-value-${movement.id}`,
            type: 'high_value_movement',
            severity: 'medium',
            title: 'Movimentação de Alto Valor',
            message: `${movement.type === 'in' ? 'Entrada' : 'Saída'} de ${movement.quantity} ${(movement.products as any).name} - R$ ${value.toFixed(2)}`,
            isRead: false,
            createdAt: movement.date,
          });
        }
      });
    }

    // Ordenar por data (mais recentes primeiro)
    return alerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }

  // Método para marcar alertas como lidos (batch operation)
  async markAlertsAsRead(alertIds: string[]): Promise<void> {
    // Implementar lógica para marcar como lidos
    // Por enquanto, apenas limpar o cache para forçar refresh
    this.clearCache();
  }
}

export const optimizedNotificationService = new OptimizedNotificationService();
