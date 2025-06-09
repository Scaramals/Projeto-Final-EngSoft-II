
import React from "react";
import { MaskedInput } from "./masked-input";

interface CpfInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

export const CpfInput: React.FC<CpfInputProps> = ({ value, onChange, ...props }) => {
  return (
    <MaskedInput
      mask="999.999.999-99"
      value={value}
      onChange={onChange}
      placeholder="000.000.000-00"
      {...props}
    />
  );
};
