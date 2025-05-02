
import React from "react";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Package } from "lucide-react";

const RegisterPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col sm:flex-row">
      <div className="bg-inventory-indigo sm:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md text-white text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start mb-6">
            <Package size={40} className="mr-2" />
            <h1 className="text-3xl font-bold">StockControl</h1>
          </div>
          <h2 className="text-2xl font-bold mb-4">
            Crie sua conta
          </h2>
          <p className="mb-6">
            Junte-se aos milhares de empresas que já controlam seus estoques de
            forma eficiente com o StockControl.
          </p>
          <ul className="space-y-2 text-left list-disc list-inside">
            <li>Comece gratuitamente</li>
            <li>Interface intuitiva e fácil de usar</li>
            <li>Suporte técnico especializado</li>
            <li>Atualizações constantes</li>
          </ul>
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <RegisterForm />
      </div>
    </div>
  );
};

export default RegisterPage;
