
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface StockLoadingAlertProps {
  isLoading: boolean;
}

export const StockLoadingAlert: React.FC<StockLoadingAlertProps> = ({
  isLoading
}) => {
  if (!isLoading) return null;

  return (
    <Alert>
      <Loader2 className="h-4 w-4 animate-spin" />
      <AlertDescription>Carregando estoque atual...</AlertDescription>
    </Alert>
  );
};
