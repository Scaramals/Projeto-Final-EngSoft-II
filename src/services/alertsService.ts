import { supabase } from "@/integrations/supabase/client";
import { SecureLogger } from "./secureLogger";

export interface Alert {
  id: string;
  type: 'low_stock' | 'high_value_movement' | 'system_warning' | 'user_activity';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  createdAt: string;
  data?: any;
}

export interface SystemIndicator {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  threshold?: {
    warning: number;
    critical: number;
  };
  trend?: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
  };
}

export class AlertsService {
  /**
   * Gerar alertas de estoque baixo
   */
  static async generateLowStockAlerts(): Promise<Alert[]> {
    try {
      SecureLogger.info('Gerando alertas de estoque baixo');
      
      // Usar função RPC para buscar produtos com estoque baixo
      const { data: lowStockProducts, error } = await supabase
        .rpc('get_low_stock_products');

      if (error) {
        SecureLogger.error('Erro ao buscar produtos com estoque baixo', error);
        return [];
      }

      SecureLogger.success(`Produtos com estoque baixo encontrados: ${lowStockProducts?.length || 0}`);

      return (lowStockProducts || []).map(product => ({
        id: `low_stock_${product.id}`,
        type: 'low_stock' as const,
        title: 'Estoque Baixo',
        message: `${product.name} está com estoque baixo (${product.quantity} unidades)`,
        severity: product.quantity === 0 ? 'critical' : 'medium' as const,
        isRead: false,
        createdAt: new Date().toISOString(),
        data: {
          productName: product.name,
          currentStock: product.quantity,
          minimumStock: product.minimum_stock
        }
      }));
    } catch (error) {
      SecureLogger.error('Erro ao gerar alertas de estoque baixo', error);
      return [];
    }
  }

  /**
   * Gerar alertas de movimentações de alto valor
   */
  static async generateHighValueMovementAlerts(): Promise<Alert[]> {
    try {
      SecureLogger.info('Gerando alertas de movimentações de alto valor');
      
      const { data: movements, error } = await supabase
        .from('stock_movements')
        .select(`
          id,
          quantity,
          type,
          date,
          products(name, price)
        `)
        .gte('date', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('date', { ascending: false });

      if (error) {
        SecureLogger.error('Erro ao buscar movimentações recentes', error);
        return [];
      }

      const alerts: Alert[] = [];
      
      movements?.forEach(movement => {
        if (movement.products) {
          const value = movement.quantity * movement.products.price;
          
          // Alerta para movimentações acima de R$ 5000
          if (value > 5000) {
            alerts.push({
              id: `high_value_${movement.id}`,
              type: 'high_value_movement',
              title: 'Movimentação de Alto Valor',
              message: `Movimentação de ${movement.type === 'in' ? 'entrada' : 'saída'} de R$ ${value.toFixed(2)} detectada`,
              severity: value > 10000 ? 'high' : 'medium',
              isRead: false,
              createdAt: movement.date,
              data: {
                productName: movement.products.name,
                quantity: movement.quantity,
                value: value,
                type: movement.type
              }
            });
          }
        }
      });

      SecureLogger.success(`Alertas de alto valor gerados: ${alerts.length}`);
      return alerts;
    } catch (error) {
      SecureLogger.error('Erro ao gerar alertas de movimentações de alto valor', error);
      return [];
    }
  }

  /**
   * Obter todos os alertas
   */
  static async getAllAlerts(): Promise<Alert[]> {
    try {
      const [lowStockAlerts, highValueAlerts] = await Promise.all([
        this.generateLowStockAlerts(),
        this.generateHighValueMovementAlerts()
      ]);

      const allAlerts = [...lowStockAlerts, ...highValueAlerts];
      
      // Ordenar por data (mais recentes primeiro)
      allAlerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      SecureLogger.success(`Total de alertas processados: ${allAlerts.length}`);
      
      return allAlerts;
    } catch (error) {
      SecureLogger.error('Erro ao obter todos os alertas', error);
      return [];
    }
  }

  /**
   * Gerar indicadores do sistema
   */
  static async getSystemIndicators(): Promise<SystemIndicator[]> {
    try {
      SecureLogger.info('Gerando indicadores do sistema');
      
      const { data: dashboardStats, error } = await supabase.rpc('get_dashboard_stats');
      
      if (error) {
        SecureLogger.error('Erro ao buscar estatísticas do dashboard', error);
        return [];
      }

      const stats = dashboardStats as any;
      
      const indicators: SystemIndicator[] = [
        {
          id: 'total_products',
          name: 'Total de Produtos',
          value: Number(stats.totalProducts) || 0,
          unit: 'produtos',
          status: 'good',
          trend: {
            direction: 'up',
            percentage: Math.floor(Math.random() * 10) + 1
          }
        },
        {
          id: 'low_stock_ratio',
          name: 'Taxa de Estoque Baixo',
          value: stats.totalProducts > 0 ? Math.round((Number(stats.lowStockProducts) / Number(stats.totalProducts)) * 100) : 0,
          unit: '%',
          status: Number(stats.lowStockProducts) > Number(stats.totalProducts) * 0.2 ? 'warning' : 'good',
          threshold: {
            warning: 20,
            critical: 40
          },
          trend: {
            direction: 'down',
            percentage: Math.floor(Math.random() * 5) + 1
          }
        },
        {
          id: 'inventory_value',
          name: 'Valor do Estoque',
          value: Number(stats.totalValue) || 0,
          unit: 'R$',
          status: 'good',
          trend: {
            direction: 'up',
            percentage: Math.floor(Math.random() * 15) + 5
          }
        },
        {
          id: 'recent_movements',
          name: 'Movimentações Recentes',
          value: Number(stats.recentMovementsCount) || 0,
          unit: 'movimentações',
          status: 'good',
          trend: {
            direction: 'stable',
            percentage: 0
          }
        }
      ];

      // Atualizar status baseado nos thresholds
      indicators.forEach(indicator => {
        if (indicator.threshold) {
          if (indicator.value >= indicator.threshold.critical) {
            indicator.status = 'critical';
          } else if (indicator.value >= indicator.threshold.warning) {
            indicator.status = 'warning';
          }
        }
      });

      SecureLogger.success('Indicadores do sistema gerados com sucesso');
      return indicators;
    } catch (error) {
      SecureLogger.error('Erro ao gerar indicadores do sistema', error);
      return [];
    }
  }
}
