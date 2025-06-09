
import React from "react";
import { MaskedInput } from "./masked-input";

interface CepInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

export const CepInput: React.FC<CepInputProps> = ({ value, onChange, ...props }) => {
  return (
    <MaskedInput
      mask="99999-999"
      value={value}
      onChange={onChange}
      placeholder="00000-000"
      {...props}
    />
  );
};
