
import React from "react";
import { PieChart } from "@/components/ui/charts";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOptimizedDashboard } from "@/hooks/useOptimizedDashboard";
import { formatCurrency } from "@/lib/utils";
import { CategoryAnalysis } from "@/types";

export const OptimizedCategoryDistributionChart: React.FC = () => {
  const { categoryAnalysis, isLoading } = useOptimizedDashboard();

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (!categoryAnalysis || categoryAnalysis.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Distribuição por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 md:h-64 flex items-center justify-center">
            <p className="text-muted-foreground text-sm">
              Nenhum dado disponível para exibição.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Gerar cores dinâmicas
  const generateColors = (count: number): string[] => {
    const colors = [];
    for (let i = 0; i < count; i++) {
      const hue = (i * 137) % 360;
      colors.push(`hsla(${hue}, 70%, 60%, 0.8)`);
    }
    return colors;
  };

  const chartData = {
    labels: categoryAnalysis.map((item: CategoryAnalysis) => item.category_name),
    datasets: [
      {
        label: "Valor por Categoria",
        data: categoryAnalysis.map((item: CategoryAnalysis) => Number(item.total_value)),
        backgroundColor: generateColors(categoryAnalysis.length),
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base md:text-lg">Distribuição por Categoria</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-48 md:h-64 mb-4">
          <PieChart
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: "bottom",
                  display: true,
                  labels: {
                    boxWidth: 12,
                    padding: 8,
                    font: {
                      size: 11
                    }
                  }
                },
                tooltip: {
                  callbacks: {
                    label: function(context: any) {
                      const label = context.label || '';
                      const value = formatCurrency(context.raw);
                      return `${label}: ${value}`;
                    }
                  }
                }
              }
            }}
          />
        </div>
        
        {/* Resumo das categorias em mobile */}
        <div className="grid grid-cols-1 gap-2 mt-4">
          {categoryAnalysis.slice(0, 3).map((item: CategoryAnalysis, index: number) => (
            <div key={index} className="flex justify-between items-center text-xs md:text-sm p-2 bg-gray-50 rounded">
              <span className="font-medium truncate">{item.category_name}</span>
              <div className="text-right">
                <div className="font-bold text-green-600">{formatCurrency(Number(item.total_value))}</div>
                <div className="text-gray-500">{item.product_count} produtos</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
