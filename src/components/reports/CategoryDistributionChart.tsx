
import React, { useState, useEffect } from "react";
import { PieChart } from "@/components/ui/charts";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";

interface CategoryData {
  name: string;
  count: number;
}

export const CategoryDistributionChart: React.FC = () => {
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch products grouped by category
        const { data, error } = await supabase
          .from('products')
          .select('category, quantity');
        
        if (error) throw error;
        
        // Process data to count products by category
        const categoryMap: Record<string, number> = {};
        data.forEach((product) => {
          const category = product.category || 'Sem categoria';
          if (!categoryMap[category]) {
            categoryMap[category] = 0;
          }
          categoryMap[category] += product.quantity;
        });
        
        // Transform to array format for the chart
        const result = Object.entries(categoryMap).map(([name, count]) => ({
          name,
          count,
        }));
        
        setCategoryData(result);
      } catch (error) {
        console.error("Error fetching category data:", error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar dados de categorias",
          description: "Não foi possível obter a distribuição por categoria.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoryData();
  }, [toast]);

  // Generate random colors for the chart
  const generateColors = (count: number): string[] => {
    const colors = [];
    for (let i = 0; i < count; i++) {
      const hue = (i * 137) % 360; // Use golden ratio for better distribution
      colors.push(`hsla(${hue}, 70%, 60%, 0.7)`);
    }
    return colors;
  };

  const chartData = {
    labels: categoryData.map((item) => item.name),
    datasets: [
      {
        label: "Quantidade em Estoque",
        data: categoryData.map((item) => item.count),
        backgroundColor: generateColors(categoryData.length),
        borderWidth: 1,
      },
    ],
  };

  return (
    <div>
      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : categoryData.length > 0 ? (
        <PieChart
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: "bottom",
                display: true,
              },
            },
          }}
        />
      ) : (
        <div className="h-64 flex items-center justify-center">
          <p className="text-muted-foreground">
            Nenhum dado disponível para exibição.
          </p>
        </div>
      )}
    </div>
  );
};
