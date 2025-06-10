
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Loader2 } from "lucide-react";

interface ValidationAlertProps {
  validationMessage: string | null;
  isValidating: boolean;
}

export const ValidationAlert: React.FC<ValidationAlertProps> = ({
  validationMessage,
  isValidating
}) => {
  if (!validationMessage && !isValidating) return null;

  if (isValidating) {
    return (
      <Alert>
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertDescription>Validando movimentação...</AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>{validationMessage}</AlertDescription>
    </Alert>
  );
};
