
import React, { useState, useEffect } from "react";
import { BarChart, LineChart, PieChart } from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { DateRangePicker } from "@/components/reports/DateRangePicker";
import { ReportFilters } from "@/components/reports/ReportFilters";
import { StockValueReport } from "@/components/reports/StockValueReport";
import { MovementsReport } from "@/components/reports/MovementsReport";
import { CategoryDistributionChart } from "@/components/reports/CategoryDistributionChart";
import AppLayout from "@/components/layout/AppLayout";

const ReportsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState({ from: new Date(new Date().setDate(new Date().getDate() - 30)), to: new Date() });
  const { toast } = useToast();

  useEffect(() => {
    // Load initial data
    const loadData = async () => {
      try {
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading report data:", error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar relatórios",
          description: "Não foi possível carregar os dados dos relatórios. Tente novamente mais tarde.",
        });
        setIsLoading(false);
      }
    };

    loadData();
  }, [toast]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleDateRangeChange = (range: { from: Date; to: Date }) => {
    setDateRange(range);
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Relatórios e Análises</h1>
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
          />
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="stock">Estoque</TabsTrigger>
            <TabsTrigger value="movements">Movimentações</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Distribuição por Categoria</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {isLoading ? (
                    <Skeleton className="h-64 w-full" />
                  ) : (
                    <CategoryDistributionChart />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Valor do Estoque</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {isLoading ? (
                    <Skeleton className="h-64 w-full" />
                  ) : (
                    <StockValueReport />
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="stock" className="space-y-4">
            <ReportFilters />
            <Card>
              <CardHeader>
                <CardTitle>Análise de Estoque</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-80 w-full" />
                ) : (
                  <BarChart
                    data={{
                      labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
                      datasets: [
                        {
                          label: "Produtos com Estoque Baixo",
                          data: [12, 15, 18, 14, 10, 8],
                          backgroundColor: "rgba(255, 99, 132, 0.5)",
                        },
                        {
                          label: "Total de Produtos",
                          data: [65, 72, 78, 84, 90, 95],
                          backgroundColor: "rgba(53, 162, 235, 0.5)",
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: "top" as const,
                        },
                        title: {
                          display: true,
                          text: "Evolução do Estoque",
                        },
                      },
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="movements" className="space-y-4">
            <ReportFilters />
            <MovementsReport dateRange={dateRange} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default ReportsPage;
