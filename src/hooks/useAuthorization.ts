
import { useAuth } from "@/contexts/AuthContext";

/**
 * Hook for role-based authorization verification
 */
export function useAuthorization() {
  const { user, profile } = useAuth();
  
  // IDs de usuários com acesso de administrador permanente
  const permanentAdminIds = [
    "7d2afaa5-2e77-43cd-b7fb-d5111ea59dc4",
    "a679c5aa-e45b-44e4-b4f2-c5e4ba5333aa"
  ];

  /**
   * Verifica se o ID do usuário atual está na lista de administradores permanentes
   */
  const hasPermanentAdminRights = (): boolean => {
    return user ? permanentAdminIds.includes(user.id) : false;
  };

  /**
   * Verifica se o usuário atual tem permissão para uma ação específica
   * @param requiredRole Papel necessário para a ação
   * @returns {boolean} Verdadeiro se o usuário tem permissão
   */
  const hasPermission = (requiredRole: 'admin' | 'employee' | 'developer'): boolean => {
    // Verifica primeiro os IDs de administrador permanentes
    if (requiredRole === 'admin' && hasPermanentAdminRights()) {
      console.log("Usuário tem direitos administrativos permanentes, permissão concedida");
      return true;
    }
    
    // Se não houver perfil, nenhuma permissão adicional
    if (!profile && !hasPermanentAdminRights()) {
      console.log("Sem perfil e não administrador permanente, permissão negada");
      return false;
    }
    
    // Desenvolvedores têm acesso a tudo
    if (profile?.role === 'developer') {
      console.log("Usuário é desenvolvedor, permissão concedida");
      return true;
    }
    
    // Administradores têm acesso à maioria das coisas
    if (profile?.role === 'admin' && requiredRole !== 'developer') {
      console.log("Usuário é administrador, permissão concedida");
      return true;
    }
    
    // Funcionários só têm acesso às suas próprias permissões
    const hasRole = profile?.role === requiredRole;
    console.log(`Usuário tem papel ${profile?.role}, necessário ${requiredRole}, permissão ${hasRole ? 'concedida' : 'negada'}`);
    return hasRole;
  };
  
  /**
   * Verifica se o usuário atual é um administrador
   * @returns {boolean} Verdadeiro se o usuário é um administrador
   */
  const isAdmin = (): boolean => {
    // Verifica primeiro os IDs de administrador permanentes
    if (hasPermanentAdminRights()) {
      console.log("Verificação isAdmin: verdadeiro (administrador permanente)");
      return true;
    }
    
    const admin = profile?.role === 'admin';
    console.log("Verificação isAdmin:", admin, "perfil:", profile);
    return admin;
  };

  /**
   * Verifica se o usuário atual é um desenvolvedor
   * @returns {boolean} Verdadeiro se o usuário é um desenvolvedor
   */
  const isDeveloper = (): boolean => {
    const developer = profile?.role === 'developer';
    console.log("Verificação isDeveloper:", developer, "perfil:", profile);
    return developer;
  };
  
  /**
   * Verifica se o usuário tem qualquer um dos papéis especificados
   * @param roles Array de papéis permitidos
   * @returns {boolean} Verdadeiro se o usuário tem pelo menos um dos papéis
   */
  const hasAnyRole = (roles: Array<'admin' | 'employee' | 'developer'>): boolean => {
    // Verifica primeiro os IDs de administrador permanentes se 'admin' estiver nos papéis
    if (roles.includes('admin') && hasPermanentAdminRights()) {
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
    userRole: profile?.role || null
  };
}
