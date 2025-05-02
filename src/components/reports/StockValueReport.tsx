
import React, { useEffect, useState } from "react";
import { LineChart } from "@/components/ui/charts";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const StockValueReport: React.FC = () => {
  const [stockValue, setStockValue] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStockValue = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase.rpc('get_total_stock_value');
        
        if (error) throw error;
        
        setStockValue(data);
      } catch (error) {
        console.error("Error fetching stock value:", error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar valor do estoque",
          description: "Não foi possível obter o valor total do estoque.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStockValue();
  }, [toast]);

  // Mock data for chart - would be replaced with real historical data
  const chartData = {
    labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
    datasets: [
      {
        label: "Valor do Estoque (R$)",
        data: [12000, 19000, 14000, 15000, 21000, stockValue || 0],
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
      },
    ],
  };

  return (
    <div>
      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <>
          <div className="mb-4 text-center">
            <p className="text-sm text-muted-foreground">Valor total atual</p>
            <h3 className="text-3xl font-bold">
              {stockValue !== null
                ? new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(stockValue)
                : "Indisponível"}
            </h3>
          </div>
          <LineChart
            data={chartData}
            options={{
              responsive: true,
              scales: {
                y: {
                  beginAtZero: false,
                },
              },
            }}
          />
        </>
      )}
    </div>
  );
};
