
import React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface MaskedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  mask: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const MaskedInput: React.FC<MaskedInputProps> = ({
  mask,
  value,
  onChange,
  placeholder,
  className,
  ...props
}) => {
  const applyMask = (inputValue: string, maskPattern: string): string => {
    const cleanValue = inputValue.replace(/\D/g, '');
    let maskedValue = '';
    let valueIndex = 0;

    for (let i = 0; i < maskPattern.length && valueIndex < cleanValue.length; i++) {
      if (maskPattern[i] === '9') {
        maskedValue += cleanValue[valueIndex];
        valueIndex++;
      } else {
        maskedValue += maskPattern[i];
      }
    }

    return maskedValue;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const maskedValue = applyMask(inputValue, mask);
    onChange(maskedValue);
  };

  return (
    <Input
      {...props}
      type="text"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className={cn(className)}
    />
  );
};
