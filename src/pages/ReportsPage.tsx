
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp, Package, BarChart3 } from "lucide-react";
import { OptimizedStockValueReport } from "@/components/reports/OptimizedStockValueReport";
import { OptimizedMovementsReport } from "@/components/reports/OptimizedMovementsReport";
import { OptimizedCategoryDistributionChart } from "@/components/reports/OptimizedCategoryDistributionChart";
import { AppLayout } from "@/components/layout/AppLayout";
import { useOptimizedDashboard } from "@/hooks/useOptimizedDashboard";
import { OptimizedApiService } from "@/services/optimizedApi";
import { useToast } from "@/components/ui/use-toast";

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { refreshAll, isLoading } = useOptimizedDashboard();
  const { toast } = useToast();

  const handleRefresh = async () => {
    try {
      OptimizedApiService.clearCache();
      await refreshAll();
      toast({
        title: "Dados atualizados",
        description: "Os relatórios foram atualizados com sucesso!",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar os dados. Tente novamente.",
      });
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-4 md:gap-6 p-2 md:p-0">
        {/* Header responsivo */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Relatórios e Análises</h1>
            <p className="text-sm text-muted-foreground">
              Acompanhe o desempenho do seu estoque em tempo real
            </p>
          </div>
          <Button 
            onClick={handleRefresh} 
            disabled={isLoading}
            size="sm"
            className="w-full sm:w-auto"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          {/* Tabs responsivas */}
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="overview" className="text-xs md:text-sm">
              <TrendingUp className="w-4 h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Visão </span>Geral
            </TabsTrigger>
            <TabsTrigger value="stock" className="text-xs md:text-sm">
              <Package className="w-4 h-4 mr-1 md:mr-2" />
              Estoque
            </TabsTrigger>
            <TabsTrigger value="movements" className="text-xs md:text-sm">
              <BarChart3 className="w-4 h-4 mr-1 md:mr-2" />
              Movimentações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <OptimizedCategoryDistributionChart />
              <OptimizedStockValueReport />
            </div>
          </TabsContent>

          <TabsContent value="stock" className="space-y-4">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <OptimizedStockValueReport />
              <OptimizedCategoryDistributionChart />
            </div>
          </TabsContent>

          <TabsContent value="movements" className="space-y-4">
            <OptimizedMovementsReport />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default ReportsPage;
