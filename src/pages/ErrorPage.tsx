
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  AlertTriangle, 
  CreditCard, 
  Server, 
  Shield, 
  Home,
  RefreshCw
} from "lucide-react";

const ErrorPage = () => {
  const { errorCode } = useParams();
  const navigate = useNavigate();

  const getErrorDetails = (code: string | undefined) => {
    switch (code) {
      case "400":
        return {
          icon: AlertTriangle,
          title: "Requisição Inválida (400)",
          description: "Os dados enviados não são válidos. Verifique as informações e tente novamente.",
          color: "bg-orange-500",
          suggestions: [
            "Verifique se todos os campos obrigatórios foram preenchidos",
            "Confirme se os dados estão no formato correto",
            "Tente atualizar a página e repetir a ação"
          ]
        };
      case "402":
        return {
          icon: CreditCard,
          title: "Pagamento Necessário (402)",
          description: "Esta funcionalidade requer um plano pago ou pagamento adicional.",
          color: "bg-purple-500",
          suggestions: [
            "Verifique seu plano atual",
            "Entre em contato com o suporte para mais informações",
            "Considere fazer upgrade do seu plano"
          ]
        };
      case "403":
        return {
          icon: Shield,
          title: "Acesso Negado (403)",
          description: "Você não tem permissão para acessar este recurso.",
          color: "bg-red-500",
          suggestions: [
            "Verifique se você está logado com a conta correta",
            "Solicite permissões adicionais ao administrador",
            "Entre em contato com o suporte se acredita que isso é um erro"
          ]
        };
      case "500":
        return {
          icon: Server,
          title: "Erro Interno do Servidor (500)",
          description: "Ocorreu um erro interno no servidor. Nossa equipe foi notificada.",
          color: "bg-red-600",
          suggestions: [
            "Tente novamente em alguns minutos",
            "Verifique sua conexão com a internet",
            "Se o problema persistir, entre em contato com o suporte"
          ]
        };
      default:
        return {
          icon: AlertTriangle,
          title: "Erro Desconhecido",
          description: "Ocorreu um erro inesperado. Por favor, tente novamente.",
          color: "bg-gray-500",
          suggestions: [
            "Tente atualizar a página",
            "Verifique sua conexão com a internet",
            "Entre em contato com o suporte se o problema persistir"
          ]
        };
    }
  };

  const errorDetails = getErrorDetails(errorCode);
  const IconComponent = errorDetails.icon;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center pb-4">
          <div className={`mx-auto w-16 h-16 ${errorDetails.color} rounded-full flex items-center justify-center mb-4`}>
            <IconComponent className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">{errorDetails.title}</CardTitle>
          <CardDescription className="text-base mt-2">
            {errorDetails.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-3">O que você pode fazer:</h3>
            <ul className="space-y-2">
              {errorDetails.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm text-gray-600">{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Tentar Novamente
            </Button>
            <Button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Voltar ao Dashboard
            </Button>
          </div>

          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Código do erro:</strong> {errorCode || "Desconhecido"}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              <strong>Horário:</strong> {new Date().toLocaleString("pt-BR")}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorPage;
