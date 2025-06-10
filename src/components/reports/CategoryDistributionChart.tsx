
import React from "react";
import { PieChart } from "@/components/ui/charts";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency } from "@/lib/utils";
import { useOptimizedDashboard } from "@/hooks/useOptimizedDashboard";

export const CategoryDistributionChart: React.FC = () => {
  const { categoryAnalysis, isLoading } = useOptimizedDashboard();
  const { toast } = useToast();

  // Gerar cores aleatórias para o gráfico
  const generateColors = (count: number): string[] => {
    const colors = [];
    for (let i = 0; i < count; i++) {
      const hue = (i * 137) % 360; // Usar proporção áurea para melhor distribuição
      colors.push(`hsla(${hue}, 70%, 60%, 0.8)`);
    }
    return colors;
  };

  // Debug logging
  React.useEffect(() => {
    console.log('CategoryDistributionChart - Analysis data:', categoryAnalysis);
  }, [categoryAnalysis]);

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (!categoryAnalysis || categoryAnalysis.length === 0) {
    console.log('CategoryDistributionChart - No data available');
    return (
      <div className="h-64 flex items-center justify-center">
        <p className="text-muted-foreground">
          Nenhum dado disponível para exibição.
        </p>
      </div>
    );
  }

  const chartData = {
    labels: categoryAnalysis.map((item) => item.category_name || 'Sem categoria'),
    datasets: [
      {
        label: "Valor por Categoria",
        data: categoryAnalysis.map((item) => Number(item.total_value) || 0),
        backgroundColor: generateColors(categoryAnalysis.length),
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  console.log('CategoryDistributionChart - Chart data prepared:', chartData);

  return (
    <div className="space-y-4">
      <PieChart
        data={chartData}
        options={{
          responsive: true,
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
                  const value = formatCurrency(context.raw || 0);
                  const total = context.dataset.data.reduce((sum: number, val: number) => sum + val, 0);
                  const percentage = ((context.raw / total) * 100).toFixed(1);
                  return `${label}: ${value} (${percentage}%)`;
                }
              }
            }
          }
        }}
      />
      
      {/* Resumo das categorias */}
      <div className="grid grid-cols-1 gap-2 mt-4">
        {categoryAnalysis.slice(0, 5).map((item, index) => (
          <div key={index} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
            <span className="font-medium truncate">{item.category_name || 'Sem categoria'}</span>
            <div className="text-right">
              <div className="font-bold text-green-600">{formatCurrency(Number(item.total_value) || 0)}</div>
              <div className="text-gray-500 text-xs">{item.product_count || 0} produtos</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
