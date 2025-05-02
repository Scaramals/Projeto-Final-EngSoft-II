
import React from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { Package } from "lucide-react";

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col sm:flex-row">
      <div className="bg-inventory-indigo sm:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md text-white text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start mb-6">
            <Package size={40} className="mr-2" />
            <h1 className="text-3xl font-bold">StockControl</h1>
          </div>
          <h2 className="text-2xl font-bold mb-4">
            Sistema de Controle de Estoque
          </h2>
          <p className="mb-6">
            Gerencie seu estoque de forma eficiente com nosso sistema completo,
            ideal para pequenos e médios negócios.
          </p>
          <ul className="space-y-2 text-left list-disc list-inside">
            <li>Cadastro e controle de produtos</li>
            <li>Gerenciamento de estoque</li>
            <li>Relatórios detalhados</li>
            <li>Sistema de alertas e notificações</li>
          </ul>
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
