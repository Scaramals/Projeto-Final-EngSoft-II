
import { useAuth } from "@/contexts/AuthContext";

/**
 * Hook for role-based authorization verification
 */
export function useAuthorization() {
  const { user, profile } = useAuth();
  
  // IDs of users with permanent admin rights
  const permanentAdminIds = [
    "7d2afaa5-2e77-43cd-b7fb-d5111ea59dc4",
    "a679c5aa-e45b-44e4-b4f2-c5e4ba5333aa"
  ];

  /**
   * Verifies if the current user ID is in the list of permanent admins
   */
  const hasPermanentAdminRights = (): boolean => {
    return user ? permanentAdminIds.includes(user.id) : false;
  };

  /**
   * Checks if the current user is a master user (can manage all aspects of the system)
   */
  const isMaster = (): boolean => {
    return hasPermanentAdminRights() || (profile?.is_master === true);
  };

  /**
   * Checks if the current user has permission for a specific action
   * @param requiredRole Role needed for the action
   * @returns {boolean} True if the user has permission
   */
  const hasPermission = (requiredRole: 'admin' | 'employee' | 'developer'): boolean => {
    // Check for permanent admin IDs or master users first
    if ((requiredRole === 'admin' && hasPermanentAdminRights()) || isMaster()) {
      console.log("User has permanent admin rights or is master, permission granted");
      return true;
    }
    
    // If no profile and not a permanent admin, no additional permissions
    if (!profile && !hasPermanentAdminRights()) {
      console.log("No profile and not a permanent admin, permission denied");
      return false;
    }
    
    // Developers have access to everything
    if (profile?.role === 'developer') {
      console.log("User is a developer, permission granted");
      return true;
    }
    
    // Admins have access to most things (except developer-specific ones)
    if (profile?.role === 'admin' && requiredRole !== 'developer') {
      console.log("User is an admin, permission granted");
      return true;
    }
    
    // Regular employees only have access to their specific permissions
    const hasRole = profile?.role === requiredRole;
    console.log(`User has role ${profile?.role}, required ${requiredRole}, permission ${hasRole ? 'granted' : 'denied'}`);
    return hasRole;
  };
  
  /**
   * Checks if the current user is an admin
   * @returns {boolean} True if the user is an admin
   */
  const isAdmin = (): boolean => {
    // Check for permanent admin IDs first
    if (hasPermanentAdminRights() || isMaster()) {
      console.log("isAdmin check: true (permanent admin or master)");
      return true;
    }
    
    const admin = profile?.role === 'admin';
    console.log("isAdmin check:", admin, "profile:", profile);
    return admin;
  };

  /**
   * Checks if the current user is a developer
   * @returns {boolean} True if the user is a developer
   */
  const isDeveloper = (): boolean => {
    const developer = profile?.role === 'developer';
    console.log("isDeveloper check:", developer, "profile:", profile);
    return developer;
  };
  
  /**
   * Checks if the user has any of the specified roles
   * @param roles Array of allowed roles
   * @returns {boolean} True if the user has at least one of the roles
   */
  const hasAnyRole = (roles: Array<'admin' | 'employee' | 'developer'>): boolean => {
    // Check for permanent admin IDs first if 'admin' is in the roles
    if (roles.includes('admin') && (hasPermanentAdminRights() || isMaster())) {
      return true;
    }
    
    if (!profile) return false;
    return roles.includes(profile.role as any);
  };
  
  return {
    hasPermission,
    isAdmin,
    isDeveloper,
    hasAnyRole,
    hasPermanentAdminRights,
    isMaster,
    userRole: profile?.role || null
  };
}
