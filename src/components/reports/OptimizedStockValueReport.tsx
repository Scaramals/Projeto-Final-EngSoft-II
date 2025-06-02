
import React from "react";
import { LineChart } from "@/components/ui/charts";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOptimizedDashboard } from "@/hooks/useOptimizedDashboard";
import { formatCurrency } from "@/lib/utils";
import { MovementSummary, DashboardStats } from "@/types";

export const OptimizedStockValueReport: React.FC = () => {
  const { stats, movementsSummary, isLoading } = useOptimizedDashboard();

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  // Processar dados para o gráfico
  const chartData = {
    labels: movementsSummary?.slice(0, 7).reverse().map((item: MovementSummary) => 
      new Date(item.movement_date).toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit' 
      })
    ) || [],
    datasets: [
      {
        label: "Valor do Estoque (R$)",
        data: movementsSummary?.slice(0, 7).reverse().map(() => Number(stats?.totalValue) || 0) || [],
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        tension: 0.4,
      },
    ],
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base md:text-lg">Evolução do Valor do Estoque</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="mb-4 text-center">
          <p className="text-xs md:text-sm text-muted-foreground">Valor total atual</p>
          <h3 className="text-xl md:text-3xl font-bold text-green-600">
            {formatCurrency(Number(stats?.totalValue) || 0)}
          </h3>
          <div className="grid grid-cols-2 gap-2 mt-2 text-xs md:text-sm">
            <div className="bg-blue-50 p-2 rounded">
              <p className="text-blue-600 font-medium">{Number(stats?.totalProducts) || 0}</p>
              <p className="text-blue-500">Total Produtos</p>
            </div>
            <div className="bg-red-50 p-2 rounded">
              <p className="text-red-600 font-medium">{Number(stats?.lowStockProducts) || 0}</p>
              <p className="text-red-500">Estoque Baixo</p>
            </div>
          </div>
        </div>
        <div className="h-48 md:h-64">
          <LineChart
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: false,
                  ticks: {
                    callback: function(value: any) {
                      return formatCurrency(Number(value) || 0);
                    }
                  }
                },
                x: {
                  ticks: {
                    maxTicksLimit: 7
                  }
                }
              },
              plugins: {
                legend: {
                  display: false
                }
              }
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};
