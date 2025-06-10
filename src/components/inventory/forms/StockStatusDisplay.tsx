
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";

interface StockStatusDisplayProps {
  productName: string;
  currentStock: number;
}

export const StockStatusDisplay: React.FC<StockStatusDisplayProps> = ({
  productName,
  currentStock
}) => {
  return (
    <Alert>
      <CheckCircle className="h-4 w-4" />
      <AlertDescription>
        <strong>{productName}</strong><br />
        Estoque atual: {currentStock} unidades
      </AlertDescription>
    </Alert>
  );
};
