
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import { CategoryAnalysis } from "@/types";
import { CategoryTooltip } from "@/components/ui/chart-tooltip";

interface CategoryPieChartProps {
  categoryAnalysis: CategoryAnalysis[] | undefined;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658'];

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ categoryAnalysis }) => {
  if (!categoryAnalysis || categoryAnalysis.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <p className="text-muted-foreground">Nenhum dado disponível</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const categoryChartData = categoryAnalysis.map((item, index) => ({
    name: item.category_name || 'Sem categoria',
    value: Number(item.total_value) || 0,
    products: Number(item.product_count) || 0,
    color: COLORS[index % COLORS.length]
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição por Categoria</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryChartData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                 {categoryChartData.map((entry) => (
                   <Cell key={`cell-${entry.name}`} fill={entry.color} />
                 ))}
              </Pie>
              <Tooltip content={<CategoryTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
