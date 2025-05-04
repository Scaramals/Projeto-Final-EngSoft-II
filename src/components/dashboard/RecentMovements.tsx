
import React from "react";
import { StockMovement } from "@/types";
import { formatDate } from "@/lib/utils";

interface RecentMovementsProps {
  movements: StockMovement[];
}

export const RecentMovements: React.FC<RecentMovementsProps> = ({ movements }) => {
  return (
    <div className="data-card">
      <h3 className="text-lg font-semibold mb-4">Movimentações Recentes</h3>
      
      {movements.length === 0 ? (
        <p className="text-muted-foreground">Nenhuma movimentação recente</p>
      ) : (
        <div className="space-y-3">
          {movements.map(movement => (
            <div 
              key={movement.id} 
              className="flex items-center justify-between border-b pb-3"
            >
              <div className="flex items-center">
                <div 
                  className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    movement.type === "in" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {movement.type === "in" ? "+" : "-"}
                </div>
                <div className="ml-3">
                  <p className="font-medium">{movement.productName || `Produto ID ${movement.productId.substring(0, 8)}`}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(movement.date)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-medium ${
                  movement.type === "in" ? "text-green-600" : "text-red-600"
                }`}>
                  {movement.type === "in" ? "+" : "-"}{movement.quantity} unid.
                </p>
                {movement.notes && (
                  <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                    {movement.notes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
