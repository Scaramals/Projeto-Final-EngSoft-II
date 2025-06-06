
import React, { useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { EnhancedDashboard } from "@/components/dashboard/EnhancedDashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download, TrendingUp } from "lucide-react";
import { useOptimizedDashboard } from "@/hooks/useOptimizedDashboard";

const ReportsPage: React.FC = () => {
  const { refreshAll } = useOptimizedDashboard();
  const pageRef = useRef<HTMLDivElement>(null);

  const handleRefresh = () => {
    refreshAll();
  };

  const handleExport = () => {
    // TODO: Implementar exportação de relatórios
    console.log("Exportar relatórios");
  };

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
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar
            </Button>
            <Button onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Enhanced Dashboard */}
        <EnhancedDashboard />

        {/* Additional Insights */}
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
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg border bg-blue-50">
                <h4 className="font-semibold text-blue-900">📈 Tendência Positiva</h4>
                <p className="text-sm text-blue-700 mt-1">
                  As entradas de estoque estão superando as saídas, indicando crescimento.
                </p>
              </div>
              <div className="p-4 rounded-lg border bg-orange-50">
                <h4 className="font-semibold text-orange-900">⚠️ Atenção</h4>
                <p className="text-sm text-orange-700 mt-1">
                  Alguns produtos estão com estoque baixo. Considere reabastecer.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ReportsPage;
