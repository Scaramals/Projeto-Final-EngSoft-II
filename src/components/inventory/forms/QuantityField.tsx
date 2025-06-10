
import React from "react";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Control } from "react-hook-form";

interface QuantityFieldProps {
  control: Control<any>;
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
}

export const QuantityField: React.FC<QuantityFieldProps> = ({
  control,
  name,
  label,
  placeholder = "Ex: 10",
  required = false
}) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}{required && '*'}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={placeholder}
              {...field}
              value={field.value === 0 ? '' : field.value.toString()}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                field.onChange(value === '' ? 0 : parseInt(value, 10));
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
