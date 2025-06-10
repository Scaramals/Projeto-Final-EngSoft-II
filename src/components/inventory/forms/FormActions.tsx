
import React from "react";
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  isValidating: boolean;
  hasInsufficientStock: boolean;
  hasSubmitted: boolean;
}

export const FormActions: React.FC<FormActionsProps> = ({
  onCancel,
  onSubmit,
  isSubmitting,
  isValidating,
  hasInsufficientStock,
  hasSubmitted
}) => {
  const getSubmitButtonText = () => {
    if (isSubmitting) return "Registrando...";
    if (isValidating) return "Validando...";
    if (hasSubmitted) return "Registrado";
    return "Registrar Movimentação";
  };

  return (
    <div className="flex gap-4 pt-4">
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
        disabled={isSubmitting || isValidating || hasInsufficientStock || hasSubmitted}
        className="flex-1"
        onClick={onSubmit}
      >
        {getSubmitButtonText()}
      </Button>
    </div>
  );
};
