
import React, { useState, useEffect } from "react";
import { PieChart } from "@/components/ui/charts";
import { ApiService } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency } from "@/lib/utils";
import { SecureLogger } from "@/services/secureLogger";

interface CategoryData {
  name: string;
  count: number;
  value: number;
}

export const CategoryDistributionChart: React.FC = () => {
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setIsLoading(true);
        SecureLogger.info('Buscando dados de distribuição por categoria');
        
        // Usar a API otimizada para buscar análise de categorias
        const categoryAnalysis = await ApiService.getCategoryAnalysis();
        
        if (!categoryAnalysis || categoryAnalysis.length === 0) {
          setCategoryData([]);
          return;
        }
        
        // Transformar dados para o formato do gráfico
        const result = categoryAnalysis.map((category: any) => ({
          name: category.category_name || 'Sem categoria',
          count: Number(category.total_quantity) || 0,
          value: Number(category.total_value) || 0,
        }));
        
        setCategoryData(result);
        SecureLogger.success(`${result.length} categorias carregadas para o gráfico`);
      } catch (error) {
        SecureLogger.error("Erro ao carregar dados de categorias:", error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar dados de categorias",
          description: "Não foi possível obter a distribuição por categoria.",
        });
        setCategoryData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoryData();
  }, [toast]);

  // Gerar cores aleatórias para o gráfico
  const generateColors = (count: number): string[] => {
    const colors = [];
    for (let i = 0; i < count; i++) {
      const hue = (i * 137) % 360; // Usar proporção áurea para melhor distribuição
      colors.push(`hsla(${hue}, 70%, 60%, 0.8)`);
    }
    return colors;
  };

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (categoryData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className="text-muted-foreground">
          Nenhum dado disponível para exibição.
        </p>
      </div>
    );
  }

  const chartData = {
    labels: categoryData.map((item) => item.name),
    datasets: [
      {
        label: "Valor por Categoria",
        data: categoryData.map((item) => item.value),
        backgroundColor: generateColors(categoryData.length),
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

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
        {categoryData.slice(0, 5).map((item, index) => (
          <div key={index} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
            <span className="font-medium truncate">{item.name}</span>
            <div className="text-right">
              <div className="font-bold text-green-600">{formatCurrency(item.value)}</div>
              <div className="text-gray-500 text-xs">{item.count} unidades</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
