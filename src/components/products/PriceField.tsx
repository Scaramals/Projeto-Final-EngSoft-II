
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { AutoCurrencyInput } from "@/components/ui/auto-currency-input";
import { Control } from "react-hook-form";

interface PriceFieldProps {
  control: Control<any>;
  name: string;
  label?: string;
  required?: boolean;
  onErrorClear?: () => void;
}

export const PriceField: React.FC<PriceFieldProps> = ({
  control,
  name,
  label = "Preço",
  required = false,
  onErrorClear
}) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}{required && '*'}</FormLabel>
          <FormControl>
            <AutoCurrencyInput
              value={field.value}
              onChange={(value) => {
                field.onChange(value);
                if (onErrorClear) onErrorClear();
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
