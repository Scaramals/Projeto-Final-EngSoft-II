
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

interface MonthlyTrend {
  month: string;
  totalIn: number;
  totalOut: number;
  net: number;
}

interface MonthlyTrendsChartProps {
  monthlyTrends: MonthlyTrend[] | undefined;
}

export const MonthlyTrendsChart: React.FC<MonthlyTrendsChartProps> = ({ monthlyTrends }) => {
  if (!monthlyTrends || monthlyTrends.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tendência Mensal</CardTitle>
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
  const chartData = monthlyTrends.map(trend => ({
    month: new Date(trend.month + '-01').toLocaleDateString('pt-BR', { 
      month: 'short', 
      year: '2-digit' 
    }),
    entradas: trend.totalIn,
    saidas: trend.totalOut,
    liquido: trend.net
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value} unidades
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendência Mensal</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="entradas" 
                stroke="#00C49F" 
                strokeWidth={2}
                name="Entradas"
              />
              <Line 
                type="monotone" 
                dataKey="saidas" 
                stroke="#FF8042" 
                strokeWidth={2}
                name="Saídas"
              />
              <Line 
                type="monotone" 
                dataKey="liquido" 
                stroke="#0088FE" 
                strokeWidth={2}
                name="Líquido"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
