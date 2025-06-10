
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle } from "lucide-react";

interface StockStatusAlertProps {
  currentStock: number;
  validationError: string | null;
}

export const StockStatusAlert: React.FC<StockStatusAlertProps> = ({
  currentStock,
  validationError
}) => {
  if (validationError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {validationError}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert>
      <CheckCircle className="h-4 w-4" />
      <AlertDescription>
        Estoque atual: <strong>{currentStock} unidades</strong>
      </AlertDescription>
    </Alert>
  );
};
