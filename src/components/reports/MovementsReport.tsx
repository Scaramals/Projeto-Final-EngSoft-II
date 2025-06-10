
import React, { useEffect, useState } from "react";
import { BarChart } from "@/components/ui/charts";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StockMovement } from "@/types";
import { formatDate } from "@/lib/utils";

interface MovementsReportProps {
  dateRange: {
    from: Date;
    to: Date;
  };
}

export const MovementsReport: React.FC<MovementsReportProps> = ({ dateRange }) => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMovements = async () => {
      try {
        setIsLoading(true);
        
        // Get days parameter based on date range
        const days = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
        
        const { data, error } = await supabase.rpc('get_recent_movements', { days });
        
        if (error) throw error;
        
        // Transform the data to match our StockMovement type
        const transformedData: StockMovement[] = data.map((movement: any) => ({
          id: movement.id,
          productId: movement.product_id,
          quantity: movement.quantity,
          type: movement.type,
          date: movement.date,
          notes: movement.notes || "",
          updatedAt: movement.updated_at || movement.date,
          supplierId: movement.supplier_id,
          createdBy: movement.created_by,
          userId: movement.user_id,
        }));
        
        setMovements(transformedData);
      } catch (error) {
        console.error("Error fetching movements:", error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar movimentações",
          description: "Não foi possível obter as movimentações recentes.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovements();
  }, [dateRange, toast]);

  // Process data for chart
  const movementsData = {
    labels: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
    datasets: [
      {
        label: "Entradas",
        data: [12, 19, 3, 5, 2, 3, 7],
        backgroundColor: "rgba(75, 192, 192, 0.5)",
      },
      {
        label: "Saídas",
        data: [2, 3, 20, 5, 1, 4, 5],
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  return (
    <div className="space-y-6">
      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <>
          <div className="rounded-lg border p-4">
            <h3 className="text-lg font-medium mb-4">
              Movimentações por Dia da Semana
            </h3>
            <BarChart
              data={movementsData}
              options={{
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">
              Movimentações Recentes
            </h3>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Produto ID</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Quantidade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.length > 0 ? (
                    movements.map((movement) => (
                      <TableRow key={movement.id}>
                        <TableCell>{formatDate(movement.date)}</TableCell>
                        <TableCell>{movement.productId.substring(0, 8)}...</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              movement.type === "in"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {movement.type === "in" ? "Entrada" : "Saída"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">{movement.quantity}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        Nenhuma movimentação encontrada para o período selecionado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
