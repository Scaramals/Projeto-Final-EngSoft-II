
import { useAuth } from "@/contexts/AuthContext";

/**
 * Hook for role-based authorization verification
 */
export function useAuthorization() {
  const { profile } = useAuth();
  
  // IDs of users with permanent admin access
  const permanentAdminIds = [
    "7d2afaa5-2e77-43cd-b7fb-d5111ea59dc4",
    "a679c5aa-e45b-44e4-b4f2-c5e4ba5333aa"
  ];

  /**
   * Verifies if the current user has permission for a specific action
   * @param requiredRole Required role for the action
   * @returns {boolean} True if the user has permission
   */
  const hasPermission = (requiredRole: 'admin' | 'employee' | 'developer'): boolean => {
    // If there's no profile, no permission
    if (!profile) {
      console.log("No profile, permission denied");
      return false;
    }
    
    // Developers have access to everything
    if (profile.role === 'developer') {
      console.log("User is developer, permission granted");
      return true;
    }
    
    // Special case: permanent admin IDs
    if (requiredRole === 'admin' && permanentAdminIds.includes(profile.id)) {
      console.log("User has permanent admin rights, permission granted");
      return true;
    }
    
    // Administrators have access to most things
    if (profile.role === 'admin' && requiredRole !== 'developer') {
      console.log("User is admin, permission granted");
      return true;
    }
    
    // Employees only have access to their own permissions
    const hasRole = profile.role === requiredRole;
    console.log(`User has role ${profile.role}, required ${requiredRole}, permission ${hasRole ? 'granted' : 'denied'}`);
    return hasRole;
  };
  
  /**
   * Checks if the current user is an administrator
   * @returns {boolean} True if the user is an administrator
   */
  const isAdmin = (): boolean => {
    // Check for permanent admin IDs first
    if (profile && permanentAdminIds.includes(profile.id)) {
      console.log("isAdmin check: true (permanent admin)");
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
    if (!profile) return false;
    
    // Check for permanent admin IDs first if 'admin' is in the roles
    if (roles.includes('admin') && permanentAdminIds.includes(profile.id)) {
      return true;
    }
    
    return roles.includes(profile.role as any);
  };
  
  /**
   * Checks if the current user has permanent admin rights
   * @returns {boolean} True if the user has permanent admin rights
   */
  const hasPermanentAdminRights = (): boolean => {
    return profile ? permanentAdminIds.includes(profile.id) : false;
  };
  
  return {
    hasPermission,
    isAdmin,
    isDeveloper,
    hasAnyRole,
    hasPermanentAdminRights,
    userRole: profile?.role || null
  };
}
