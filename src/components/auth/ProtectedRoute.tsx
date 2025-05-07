
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

  // Developer-only route check
  if (developerOnly && !isDeveloper()) {
    console.log("Developer only route, user is not a developer, redirecting");
    return <Navigate to="/dashboard" />;
  }

  // Admin-only route check - allow permanent admins even without profile
  if (adminOnly && !isAdmin() && !isDeveloper() && !hasPermanentAdminRights()) {
    // If the route is admin-only and the user is not an admin or developer, redirect to dashboard
    console.log("Admin only route, user is not admin or developer, redirecting");
    return <Navigate to="/dashboard" />;
  }

  // Check for specific roles if provided
  if (requiredRoles && requiredRoles.length > 0) {
    // Allow permanent admins if admin role is required
    const isPermanentAdmin = hasPermanentAdminRights() && requiredRoles.includes('admin');
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

  // Render the protected content
  console.log("Access granted, rendering protected content");
  return <>{children}</>;
};
