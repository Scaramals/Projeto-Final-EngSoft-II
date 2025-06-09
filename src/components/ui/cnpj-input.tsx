
import React from "react";
import { MaskedInput } from "./masked-input";

interface CnpjInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

export const CnpjInput: React.FC<CnpjInputProps> = ({ value, onChange, ...props }) => {
  return (
    <MaskedInput
      mask="99.999.999/9999-99"
      value={value}
      onChange={onChange}
      placeholder="00.000.000/0000-00"
      {...props}
    />
  );
};
