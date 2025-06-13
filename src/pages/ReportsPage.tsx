
import React, { useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { OptimizedStockValueReport } from "@/components/reports/OptimizedStockValueReport";
import { OptimizedCategoryDistributionChart } from "@/components/reports/OptimizedCategoryDistributionChart";
import { OptimizedMovementsReport } from "@/components/reports/OptimizedMovementsReport";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { useOptimizedDashboard } from "@/hooks/useOptimizedDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

const ReportsPage: React.FC = () => {
  const { 
    stats, 
    movementsSummary, 
    categoryAnalysis, 
    monthlyComparison,
    isLoading, 
    refreshAll 
  } = useOptimizedDashboard();
  
  const pageRef = useRef<HTMLDivElement>(null);

  const handleRefresh = () => {
    refreshAll();
  };

  const handleExport = () => {
    // TODO: Implementar exportação de relatórios
    console.log("Exportar relatórios");
  };

  // Calcular insights baseados nos dados reais
  const insights = React.useMemo(() => {
    if (!stats || !movementsSummary || !monthlyComparison) return [];
    
    const insights = [];
    
    // Insight sobre crescimento de movimentações
    if (monthlyComparison.movementsGrowth > 0) {
      insights.push({
        type: 'positive',
        title: '📈 Crescimento nas Movimentações',
        description: `As movimentações cresceram ${monthlyComparison.movementsGrowth.toFixed(1)}% em relação ao mês passado.`
      });
    } else if (monthlyComparison.movementsGrowth < -10) {
      insights.push({
        type: 'warning',
        title: '📉 Redução nas Movimentações',
        description: `As movimentações diminuíram ${Math.abs(monthlyComparison.movementsGrowth).toFixed(1)}% em relação ao mês passado.`
      });
    }
    
    // Insight sobre estoque baixo
    if (Number(stats.lowStockProducts) > 0) {
      insights.push({
        type: 'warning',
        title: '⚠️ Produtos com Estoque Baixo',
        description: `${stats.lowStockProducts} produtos estão com estoque baixo e precisam de reabastecimento.`
      });
    } else {
      insights.push({
        type: 'positive',
        title: '✅ Estoque Saudável',
        description: 'Todos os produtos estão com níveis adequados de estoque.'
      });
    }
    
    // Insight sobre valor total
    const totalValue = Number(stats.totalValue);
    if (totalValue > 50000) {
      insights.push({
        type: 'positive',
        title: '💰 Alto Valor em Estoque',
        description: `Seu estoque possui um valor total de ${formatCurrency(totalValue)}, indicando um bom investimento.`
      });
    }
    
    return insights;
  }, [stats, movementsSummary, monthlyComparison]);

  return (
    <AppLayout>
      <div ref={pageRef} className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Relatórios e Análises</h1>
            <p className="text-muted-foreground">
              Acompanhe o desempenho do seu estoque com dashboards interativos
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Stats Summary Cards */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array(4).fill(0).map((_, index) => (
              <Skeleton key={index} className="h-32 w-full" />
            ))}
          </div>
        ) : stats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Produtos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProducts}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Valor Total do Estoque
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(Number(stats.totalValue))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Produtos Estoque Baixo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {stats.lowStockProducts}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Movimentações (30 dias)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.recentMovementsCount}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Charts Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <OptimizedStockValueReport />
          </div>
          <div>
            <OptimizedCategoryDistributionChart />
          </div>
        </div>

        {/* Movements Report */}
        <div className="w-full">
          <OptimizedMovementsReport />
        </div>

        {/* Insights e Recomendações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Insights e Recomendações
            </CardTitle>
            <CardDescription>
              Análises automáticas baseadas nos dados do seu estoque
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {insights.map((insight, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-lg border ${
                      insight.type === 'positive' 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-orange-50 border-orange-200'
                    }`}
                  >
                    <h4 className={`font-semibold ${
                      insight.type === 'positive' 
                        ? 'text-green-900' 
                        : 'text-orange-900'
                    }`}>
                      {insight.title}
                    </h4>
                    <p className={`text-sm mt-1 ${
                      insight.type === 'positive' 
                        ? 'text-green-700' 
                        : 'text-orange-700'
                    }`}>
                      {insight.description}
                    </p>
                  </div>
                ))}
                
                {insights.length === 0 && (
                  <div className="col-span-2 text-center py-8 text-muted-foreground">
                    <TrendingUp className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>Carregando insights...</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ReportsPage;
