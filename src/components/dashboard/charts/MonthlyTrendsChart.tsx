
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

interface MonthlyTrendsChartProps {
  monthlyTrends: any[] | undefined;
}

export const MonthlyTrendsChart: React.FC<MonthlyTrendsChartProps> = ({ monthlyTrends }) => {
  const monthlyTrendsData = monthlyTrends?.slice(-6).map(item => ({
    month: new Date(item.month + '-01').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
    entradas: item.totalIn,
    saidas: item.totalOut,
    liquido: item.net
  })) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendência Mensal</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyTrendsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="entradas" fill="#00C49F" name="Entradas" />
              <Bar dataKey="saidas" fill="#FF8042" name="Saídas" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
