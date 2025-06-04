
import React from "react";
import { BarChart } from "@/components/ui/charts";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOptimizedDashboard } from "@/hooks/useOptimizedDashboard";
import { ArrowUpRight, ArrowDownLeft, BarChart3 } from "lucide-react";
import { MovementSummary } from "@/types";

export const OptimizedMovementsReport: React.FC = () => {
  const { movementsSummary, isLoading } = useOptimizedDashboard();

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (!movementsSummary || movementsSummary.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Movimentações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 md:h-64 flex items-center justify-center">
            <p className="text-muted-foreground text-sm">
              Nenhuma movimentação encontrada.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Processar dados para o gráfico (últimos 7 dias)
  const last7Days = movementsSummary.slice(0, 7).reverse();
  
  const chartData = {
    labels: last7Days.map((item: MovementSummary) => 
      new Date(item.movement_date).toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit' 
      })
    ),
    datasets: [
      {
        label: "Entradas",
        data: last7Days.map((item: MovementSummary) => Number(item.total_in) || 0),
        backgroundColor: "rgba(34, 197, 94, 0.6)",
        borderColor: "rgba(34, 197, 94, 1)",
        borderWidth: 1,
      },
      {
        label: "Saídas",
        data: last7Days.map((item: MovementSummary) => Number(item.total_out) || 0),
        backgroundColor: "rgba(239, 68, 68, 0.6)",
        borderColor: "rgba(239, 68, 68, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Calcular totais
  const totalIn = movementsSummary.reduce((sum: number, item: MovementSummary) => sum + (Number(item.total_in) || 0), 0);
  const totalOut = movementsSummary.reduce((sum: number, item: MovementSummary) => sum + (Number(item.total_out) || 0), 0);
  const netMovement = totalIn - totalOut;

  return (
    <Card className="w-full max-w-full overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base md:text-lg">Movimentações dos Últimos 7 Dias</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 px-2 md:px-6">
        {/* Resumo em cards */}
        <div className="grid grid-cols-3 gap-1 md:gap-2 mb-4">
          <div className="bg-green-50 p-2 md:p-3 rounded-lg text-center">
            <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4 text-green-600 mx-auto mb-1" />
            <p className="text-xs text-green-600">Entradas</p>
            <p className="text-sm md:text-lg font-bold text-green-700">{totalIn}</p>
          </div>
          <div className="bg-red-50 p-2 md:p-3 rounded-lg text-center">
            <ArrowDownLeft className="w-3 h-3 md:w-4 md:h-4 text-red-600 mx-auto mb-1" />
            <p className="text-xs text-red-600">Saídas</p>
            <p className="text-sm md:text-lg font-bold text-red-700">{totalOut}</p>
          </div>
          <div className={`p-2 md:p-3 rounded-lg text-center ${netMovement >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
            <BarChart3 className={`w-3 h-3 md:w-4 md:h-4 mx-auto mb-1 ${netMovement >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
            <p className={`text-xs ${netMovement >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>Saldo</p>
            <p className={`text-sm md:text-lg font-bold ${netMovement >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
              {netMovement >= 0 ? '+' : ''}{netMovement}
            </p>
          </div>
        </div>

        <div className="h-40 md:h-64 w-full overflow-hidden">
          <BarChart
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: "top",
                  labels: {
                    boxWidth: 8,
                    padding: 4,
                    font: {
                      size: 10
                    }
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1,
                    font: {
                      size: 10
                    }
                  }
                },
                x: {
                  ticks: {
                    maxTicksLimit: 7,
                    font: {
                      size: 10
                    }
                  }
                }
              }
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};
