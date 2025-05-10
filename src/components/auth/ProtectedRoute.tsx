
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
  const { hasPermission, isAdmin, isDeveloper, hasAnyRole, hasPermanentAdminRights, isMaster } = useAuthorization();

  console.log("ProtectedRoute check:", { 
    user: user?.id, 
    adminOnly,
    developerOnly,
    requiredRoles, 
    isAdmin: isAdmin(),
    isDeveloper: isDeveloper(),
    isMaster: isMaster(),
    hasPermanentAdminRights: hasPermanentAdminRights(),
    loading 
  });

  // Show loading state while checking authentication
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

  // If not authenticated, redirect to login
  if (!user) {
    console.log("Not authenticated, redirecting to login");
    return <Navigate to="/login" />;
  }

  // Check for developer-only route
  if (developerOnly && !isDeveloper()) {
    console.log("Developer-only route, user is not a developer, redirecting");
    return <Navigate to="/dashboard" />;
  }

  // Check for admin-only route - allow master users or permanent admins
  if (adminOnly && !isAdmin() && !isDeveloper() && !hasPermanentAdminRights() && !isMaster()) {
    console.log("Admin-only route, user is not an admin, developer, or master, redirecting");
    return <Navigate to="/dashboard" />;
  }

  // Check specific roles if provided
  if (requiredRoles && requiredRoles.length > 0) {
    // Allow permanent admins or master users if admin role is required
    const isPermanentAdmin = (hasPermanentAdminRights() || isMaster()) && requiredRoles.includes('admin');
    const hasRequiredRole = hasAnyRole(requiredRoles) || isPermanentAdmin;
    
    console.log("Required roles check:", { 
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

  // Render the protected content
  console.log("Access granted, rendering protected content");
  return <>{children}</>;
};
