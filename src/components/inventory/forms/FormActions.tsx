
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface FormActionsProps {
  onCancel: () => void;
  onSubmit?: (e: React.FormEvent) => void | Promise<void>;
  isSubmitting: boolean;
  hasValidationError?: boolean;
  isValidating?: boolean;
  hasInsufficientStock?: boolean;
  hasSubmitted?: boolean;
}

export const FormActions: React.FC<FormActionsProps> = ({
  onCancel,
  onSubmit,
  isSubmitting,
  hasValidationError = false,
  isValidating = false,
  hasInsufficientStock = false,
  hasSubmitted = false
}) => {
  const isDisabled = isSubmitting || hasValidationError || hasInsufficientStock || isValidating;

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
        disabled={isDisabled}
        className="flex-1"
        onClick={onSubmit}
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
