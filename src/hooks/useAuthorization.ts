
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
    if (!profile) return false;
    
    // Administradores têm acesso a tudo
    if (profile.role === 'admin') return true;
    
    // Funcionários só têm acesso às suas próprias permissões
    return profile.role === requiredRole;
  };
  
  /**
   * Verifica se o usuário atual é administrador
   * @returns {boolean} Verdadeiro se o usuário é administrador
   */
  const isAdmin = (): boolean => {
    return profile?.role === 'admin';
  };
  
  return {
    hasPermission,
    isAdmin
  };
}
