
import { useAuth } from "@/contexts/AuthContext";

/**
 * Hook para verificação de autorização baseada em papéis
 */
export function useAuthorization() {
  const { profile } = useAuth();
  
  /**
   * Verifica se o usuário atual possui permissão para determinada ação
   * @param requiredRole Papel necessário para a ação
   * @returns {boolean} Verdadeiro se o usuário tem permissão
   */
  const hasPermission = (requiredRole: 'admin' | 'employee'): boolean => {
    // Se não há perfil, não tem permissão
    if (!profile) {
      console.log("No profile, permission denied");
      return false;
    }
    
    // Administradores têm acesso a tudo
    if (profile.role === 'admin') {
      console.log("User is admin, permission granted");
      return true;
    }
    
    // Funcionários só têm acesso às suas próprias permissões
    const hasRole = profile.role === requiredRole;
    console.log(`User has role ${profile.role}, required ${requiredRole}, permission ${hasRole ? 'granted' : 'denied'}`);
    return hasRole;
  };
  
  /**
   * Verifica se o usuário atual é administrador
   * @returns {boolean} Verdadeiro se o usuário é administrador
   */
  const isAdmin = (): boolean => {
    const admin = profile?.role === 'admin';
    console.log("isAdmin check:", admin, "profile:", profile);
    return admin;
  };
  
  /**
   * Verifica se o usuário possui um dos papéis especificados
   * @param roles Array de papéis permitidos
   * @returns {boolean} Verdadeiro se o usuário tem pelo menos um dos papéis
   */
  const hasAnyRole = (roles: Array<'admin' | 'employee'>): boolean => {
    if (!profile) return false;
    return roles.includes(profile.role);
  };
  
  return {
    hasPermission,
    isAdmin,
    hasAnyRole,
    userRole: profile?.role || null
  };
}
