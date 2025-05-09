
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthorization } from "@/hooks/useAuthorization";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  developerOnly?: boolean;
  requiredRoles?: Array<'admin' | 'employee' | 'developer'>;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  adminOnly = false,
  developerOnly = false,
  requiredRoles,
}) => {
  const { user, loading } = useAuth();
  const { hasPermission, isAdmin, isDeveloper, hasAnyRole, hasPermanentAdminRights } = useAuthorization();

  console.log("ProtectedRoute check:", { 
    user: user?.id, 
    adminOnly,
    developerOnly,
    requiredRoles, 
    isAdmin: isAdmin(),
    isDeveloper: isDeveloper(),
    hasPermanentAdminRights: hasPermanentAdminRights(),
    loading 
  });

  // Exibe estado de carregamento enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
    );
  }

  // Se não estiver autenticado, redireciona para o login
  if (!user) {
    console.log("Não autenticado, redirecionando para login");
    return <Navigate to="/login" />;
  }

  // Verificação de rota apenas para desenvolvedores
  if (developerOnly && !isDeveloper()) {
    console.log("Rota apenas para desenvolvedores, usuário não é desenvolvedor, redirecionando");
    return <Navigate to="/dashboard" />;
  }

  // Verificação de rota apenas para administradores - permite administradores permanentes mesmo sem perfil
  if (adminOnly && !isAdmin() && !isDeveloper() && !hasPermanentAdminRights()) {
    console.log("Rota apenas para administradores, usuário não é administrador ou desenvolvedor, redirecionando");
    return <Navigate to="/dashboard" />;
  }

  // Verifica papéis específicos se fornecidos
  if (requiredRoles && requiredRoles.length > 0) {
    // Permite administradores permanentes se o papel de administrador for necessário
    const isPermanentAdmin = hasPermanentAdminRights() && requiredRoles.includes('admin');
    const hasRequiredRole = hasAnyRole(requiredRoles) || isPermanentAdmin;
    
    console.log("Verificação de papéis necessários:", { 
      requiredRoles, 
      hasRequiredRole, 
      isPermanentAdmin
    });
    
    if (!hasRequiredRole) {
      return (
        <div className="container py-8 max-w-2xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Acesso negado</AlertTitle>
            <AlertDescription>
              Você não tem permissão para acessar esta página. 
              Por favor, contate o administrador para mais informações.
            </AlertDescription>
          </Alert>
          
          <div className="mt-6 text-center">
            <Navigate to="/dashboard" />
          </div>
        </div>
      );
    }
  }

  // Renderiza o conteúdo protegido
  console.log("Acesso concedido, renderizando conteúdo protegido");
  return <>{children}</>;
};
