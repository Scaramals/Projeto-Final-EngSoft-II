
import React from "react";
import { MaskedInput } from "./masked-input";

interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({ value, onChange, ...props }) => {
  // Detecta se é celular (11 dígitos) ou fixo (10 dígitos)
  const mask = value.replace(/\D/g, '').length <= 10 ? "(99) 9999-9999" : "(99) 99999-9999";
  
  return (
    <MaskedInput
      mask={mask}
      value={value}
      onChange={onChange}
      placeholder="(00) 00000-0000"
      {...props}
    />
  );
};
