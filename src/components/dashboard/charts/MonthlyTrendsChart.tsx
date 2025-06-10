
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { useSupplierMovements } from "@/hooks/useSupplierMovements";

export const MonthlyTrendsChart: React.FC = () => {
  const { supplierMovements, isLoading } = useSupplierMovements();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fornecedores com Mais Saídas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!supplierMovements || supplierMovements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fornecedores com Mais Saídas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <p className="text-muted-foreground">Nenhum dado disponível</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Formattar dados para o gráfico
  const chartData = supplierMovements.map(supplier => ({
    name: supplier.supplierName.length > 15 
      ? supplier.supplierName.substring(0, 15) + '...' 
      : supplier.supplierName,
    fullName: supplier.supplierName,
    saidas: supplier.totalOut
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded shadow">
          <p className="font-medium">{data.fullName}</p>
          <p className="text-red-600">
            Saídas: {data.saidas} unidades
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fornecedores com Mais Saídas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="saidas" 
                fill="#FF8042" 
                name="Saídas"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
