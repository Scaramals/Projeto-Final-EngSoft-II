
import React from "react";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ControllerRenderProps } from "react-hook-form";

interface MovementTypeFieldProps {
  field: ControllerRenderProps<any, "type">;
  isLoading: boolean;
}

export const MovementTypeField: React.FC<MovementTypeFieldProps> = ({
  field,
  isLoading
}) => {
  return (
    <FormItem>
      <FormLabel>Tipo de movimentação</FormLabel>
      <Select
        onValueChange={(value) => {
          console.log('🔄 [TYPE] Tipo selecionado:', value);
          field.onChange(value);
        }}
        defaultValue={field.value}
        disabled={isLoading}
      >
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="in">Entrada</SelectItem>
          <SelectItem value="out">Saída</SelectItem>
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  );
};
