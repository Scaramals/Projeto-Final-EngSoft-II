
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface FormActionsProps {
  onCancel: () => void;
  isSubmitting: boolean;
  hasValidationError: boolean;
}

export const FormActions: React.FC<FormActionsProps> = ({
  onCancel,
  isSubmitting,
  hasValidationError
}) => {
  return (
    <div className="flex gap-2 pt-2">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSubmitting}
        className="flex-1"
      >
        Cancelar
      </Button>
      <Button
        type="submit"
        disabled={isSubmitting || hasValidationError}
        className="flex-1"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Registrando...
          </>
        ) : (
          "Registrar"
        )}
      </Button>
    </div>
  );
};
