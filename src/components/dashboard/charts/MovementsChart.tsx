
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from "recharts";
import { Package } from "lucide-react";
import { MovementSummary } from "@/types";

interface MovementsChartProps {
  movementsSummary: MovementSummary[] | undefined;
}

export const MovementsChart: React.FC<MovementsChartProps> = ({ movementsSummary }) => {
  const movementsChartData = movementsSummary?.slice(0, 7).reverse().map(item => ({
    date: new Date(item.movement_date).toLocaleDateString('pt-BR'),
    entradas: item.total_in,
    saidas: item.total_out,
    liquido: item.net_movement
  })) || [];

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Movimentações dos Últimos 7 Dias
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={movementsChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
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
