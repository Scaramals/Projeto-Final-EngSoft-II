
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
  requiredRoles?: Array<'admin' | 'employee'>;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  adminOnly = false,
  requiredRoles,
}) => {
  const { user, profile, loading } = useAuth();
  const { hasPermission, isAdmin, hasAnyRole } = useAuthorization();

  console.log("ProtectedRoute check:", { 
    user: user?.id, 
    profile, 
    adminOnly, 
    requiredRoles, 
    isAdmin: isAdmin(),
    loading 
  });

  // Mostrar estado de carregamento enquanto verifica autenticação
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

  // Se não autenticado, redirecionar para login
  if (!user) {
    console.log("Not authenticated, redirecting to login");
    return <Navigate to="/login" />;
  }

  // Verificação baseada em papéis
  if (adminOnly && !isAdmin()) {
    // Se a rota for apenas para admin e o usuário não for admin, redireciona para dashboard
    console.log("Admin only route, user is not admin, redirecting");
    return <Navigate to="/dashboard" />;
  }

  // Verificação de papéis específicos se fornecidos
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = hasAnyRole(requiredRoles);
    console.log("Required roles check:", { requiredRoles, hasRequiredRole });
    
    if (!hasRequiredRole) {
      return (
        <div className="container py-8 max-w-2xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Acesso negado</AlertTitle>
            <AlertDescription>
              Você não tem permissão para acessar esta página. 
              Por favor, entre em contato com o administrador para mais informações.
            </AlertDescription>
          </Alert>
          
          <div className="mt-6 text-center">
            <Navigate to="/dashboard" />
          </div>
        </div>
      );
    }
  }

  // Renderizar o conteúdo protegido
  console.log("Access granted, rendering protected content");
  return <>{children}</>;
};
