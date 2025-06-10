
import { supabase } from "@/integrations/supabase/client";
import { cacheService } from "./cacheService";
import { Alert } from "./alertsService";

class OptimizedNotificationService {
  private readonly CACHE_DURATION = 120000; // 2 minutos

  async getAlerts(useCache: boolean = true): Promise<Alert[]> {
    const cacheKey = 'notifications_v2';

    // Verificar cache
    if (useCache) {
      const cached = cacheService.get<Alert[]>(cacheKey);
      if (cached) {
        console.log('✅ NotificationService - Alerts from cache');
        return cached;
      }
    }

    console.log('🔄 NotificationService - Fetching fresh alerts');
    
    // Buscar dados frescos
    const alerts = await this.fetchFreshAlerts();
    
    // Atualizar cache
    if (useCache) {
      cacheService.set(cacheKey, alerts, this.CACHE_DURATION);
    }

    return alerts;
  }

  private async fetchFreshAlerts(): Promise<Alert[]> {
    const alerts: Alert[] = [];

    try {
      // Buscar produtos com estoque baixo
      const { data: lowStockProducts } = await supabase
        .from('products')
        .select('id, name, quantity, minimum_stock')
        .not('minimum_stock', 'is', null)
        .filter('quantity', 'lte', 'minimum_stock')
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
        .gte('date', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
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

      console.log('✅ NotificationService - Fresh alerts loaded:', alerts.length);
      
    } catch (error) {
      console.error('❌ NotificationService - Error fetching alerts:', error);
    }

    // Ordenar por data (mais recentes primeiro)
    return alerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  clearCache(): void {
    cacheService.deleteByPattern('notifications_');
    console.log('🧹 NotificationService - Cache cleared');
  }

  async markAlertsAsRead(alertIds: string[]): Promise<void> {
    // Limpar cache para forçar refresh
    this.clearCache();
    console.log('🔄 NotificationService - Alerts marked as read, cache cleared');
  }
}

export const optimizedNotificationService = new OptimizedNotificationService();
