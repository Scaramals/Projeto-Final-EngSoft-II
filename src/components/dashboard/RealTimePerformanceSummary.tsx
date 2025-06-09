
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Package, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PerformanceData {
  currentMonthIn: number;
  currentMonthOut: number;
  lastMonthIn: number;
  lastMonthOut: number;
  lowStockCount: number;
  totalProducts: number;
  totalValue: number;
}

export const RealTimePerformanceSummary: React.FC = () => {
  const { data: performanceData, isLoading } = useQuery({
    queryKey: ['real-time-performance'],
    queryFn: async (): Promise<PerformanceData> => {
      const now = new Date();
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      
      // Buscar dados em paralelo para melhor performance
      const [
        currentMovements,
        lastMovements,
        products,
        stockValue
      ] = await Promise.all([
        // Movimentações do mês atual
        supabase
          .from('stock_movements')
          .select('quantity, type')
          .gte('date', currentMonth.toISOString()),
        
        // Movimentações do mês passado
        supabase
          .from('stock_movements')
          .select('quantity, type')
          .gte('date', lastMonth.toISOString())
          .lt('date', currentMonth.toISOString()),
        
        // Produtos com estoque baixo
        supabase
          .from('products')
          .select('id, quantity, minimum_stock, price')
          .not('minimum_stock', 'is', null),
        
        // Valor total do estoque
        supabase.rpc('get_total_stock_value')
      ]);

      const currentIn = currentMovements.data?.filter(m => m.type === 'in').reduce((sum, m) => sum + m.quantity, 0) || 0;
      const currentOut = currentMovements.data?.filter(m => m.type === 'out').reduce((sum, m) => sum + m.quantity, 0) || 0;
      const lastIn = lastMovements.data?.filter(m => m.type === 'in').reduce((sum, m) => sum + m.quantity, 0) || 0;
      const lastOut = lastMovements.data?.filter(m => m.type === 'out').reduce((sum, m) => sum + m.quantity, 0) || 0;
      
      const lowStockProducts = products.data?.filter(p => 
        p.minimum_stock && p.quantity <= p.minimum_stock
      ) || [];

      return {
        currentMonthIn: currentIn,
        currentMonthOut: currentOut,
        lastMonthIn: lastIn,
        lastMonthOut: lastOut,
        lowStockCount: lowStockProducts.length,
        totalProducts: products.data?.length || 0,
        totalValue: stockValue.data || 0
      };
    },
    refetchInterval: 30000, // Atualizar a cada 30 segundos
    staleTime: 15000, // Considerar dados frescos por 15 segundos
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resumo de Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!performanceData) return null;

  const entriesGrowth = performanceData.lastMonthIn === 0 ? 100 : 
    ((performanceData.currentMonthIn - performanceData.lastMonthIn) / performanceData.lastMonthIn) * 100;
  
  const exitsGrowth = performanceData.lastMonthOut === 0 ? 100 : 
    ((performanceData.currentMonthOut - performanceData.lastMonthOut) / performanceData.lastMonthOut) * 100;
  
  const totalMovements = performanceData.currentMonthIn + performanceData.currentMonthOut;
  const lastTotalMovements = performanceData.lastMonthIn + performanceData.lastMonthOut;
  const movementsGrowth = lastTotalMovements === 0 ? 100 : 
    ((totalMovements - lastTotalMovements) / lastTotalMovements) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Resumo de Performance em Tempo Real
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Entradas este mês</span>
              <div className="flex items-center gap-1">
                {entriesGrowth >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm ${
                  entriesGrowth >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {Math.abs(entriesGrowth).toFixed(1)}%
                </span>
              </div>
            </div>
            <Progress value={Math.min(Math.abs(entriesGrowth), 100)} />
            <p className="text-xs text-muted-foreground">
              {performanceData.currentMonthIn} unidades vs {performanceData.lastMonthIn} no mês anterior
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Saídas este mês</span>
              <div className="flex items-center gap-1">
                {exitsGrowth >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-red-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-green-500" />
                )}
                <span className={`text-sm ${
                  exitsGrowth >= 0 ? 'text-red-500' : 'text-green-500'
                }`}>
                  {Math.abs(exitsGrowth).toFixed(1)}%
                </span>
              </div>
            </div>
            <Progress value={Math.min(Math.abs(exitsGrowth), 100)} />
            <p className="text-xs text-muted-foreground">
              {performanceData.currentMonthOut} unidades vs {performanceData.lastMonthOut} no mês anterior
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Alertas de estoque</span>
              <div className="flex items-center gap-1">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <span className="text-sm text-orange-500">
                  {performanceData.lowStockCount}
                </span>
              </div>
            </div>
            <Progress 
              value={(performanceData.lowStockCount / Math.max(performanceData.totalProducts, 1)) * 100} 
              className="[&>div]:bg-orange-500"
            />
            <p className="text-xs text-muted-foreground">
              {performanceData.lowStockCount} de {performanceData.totalProducts} produtos com estoque baixo
            </p>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Valor total em estoque</span>
            <span className="text-lg font-bold text-primary">
              R$ {performanceData.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
