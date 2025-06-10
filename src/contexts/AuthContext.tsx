import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Profile } from "@/types";
import { cacheService } from "@/services/cacheService";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  updateProfile: (profile: Partial<Profile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Função otimizada para buscar perfil de usuário
  const fetchUserProfile = async (userId: string) => {
    try {
      // O profile ainda está carregando
      if (loading) return;
      
      setLoading(true);
      
      // Tenta buscar do cache primeiro
      const cachedProfile = cacheService.get<Profile>(`profile_${userId}`);
      if (cachedProfile) {
        setProfile(cachedProfile);
        console.log("Profile loaded from cache:", cachedProfile);
        setLoading(false);
        return;
      }
      
      console.log("Fetching profile from supabase for userId:", userId);
      
      // Use the security definer function to avoid infinite recursion
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      
      if (error) {
        console.error("Supabase query error:", error);
        throw error;
      }
      
      console.log("Profile data received:", data);
      
      if (data) {
        const profileData: Profile = {
          id: data.id,
          full_name: data.full_name, // Corrigido
          role: data.role as 'admin' | 'employee' | 'developer',
          created_at: data.created_at,
          updated_at: data.updated_at,
          is_master: data.is_master || false
        };
        
        // Armazene o perfil em cache por 10 minutos
        cacheService.set(`profile_${userId}`, profileData, 600);
        setProfile(profileData);
      } else {
        console.log("No profile found for user");
        setProfile(null);
      }
    } catch (err) {
      const error = err as Error;
      console.error("Error in fetchProfile:", error);
      
      // In case of error, set profile to null but don't block auth
      setProfile(null);
      
      toast({
        variant: "destructive",
        title: "Erro ao carregar perfil",
        description: "Não foi possível carregar suas informações de perfil. Tente recarregar a página."
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Função para forçar atualização do perfil
  const refreshProfile = async () => {
    if (!user) return;
    
    // Limpa o cache para este usuário
    cacheService.delete(`profile_${user.id}`);
    
    // Força carregamento novamente
    await fetchUserProfile(user.id);
  };

  useEffect(() => {
    // Set up auth state listener FIRST to avoid deadlocks
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession?.user?.id);
        
        // Synchronous state updates to prevent deadlocks
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Profile fetching needs to be deferred to prevent recursion
        if (currentSession?.user) {
          setTimeout(() => {
            fetchUserProfile(currentSession.user.id);
          }, 0);
        } else {
          setProfile(null);
        }

        // Handle auth events - only navigate if we're not already on the target route
        if (event === 'SIGNED_IN') {
          const currentPath = window.location.pathname;
          if (!currentPath.startsWith('/dashboard') && !currentPath.startsWith('/products') && 
              !currentPath.startsWith('/inventory') && !currentPath.startsWith('/suppliers') && 
              !currentPath.startsWith('/reports') && !currentPath.startsWith('/admin') && 
              !currentPath.startsWith('/settings')) {
            navigate('/dashboard');
          }
        } else if (event === 'SIGNED_OUT') {
          const currentPath = window.location.pathname;
          if (currentPath !== '/login' && currentPath !== '/register' && 
              currentPath !== '/forgot-password' && currentPath !== '/') {
            navigate('/login');
          }
          // Clear cache on logout
          cacheService.clear();
        }
      }
    );

    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        setLoading(true);
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          
          // Fetch user profile data after updating user state
          if (currentSession.user) {
            await fetchUserProfile(currentSession.user.id);
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Cleanup subscription
    return () => {
      subscription?.unsubscribe();
    };
  }, [navigate]);

  // Métodos de autenticação com tratamento de erros aprimorado
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error, data } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      
      if (!data.user) {
        throw new Error("Não foi possível obter informações do usuário.");
      }
      
      toast({
        title: "Login bem-sucedido",
        description: "Bem-vindo ao StockControl",
      });
    } catch (error: any) {
      console.error("Login error details:", error);
      
      let errorMessage = "Verifique suas credenciais e tente novamente";
      if (error.message.includes("Invalid login")) {
        errorMessage = "Credenciais inválidas. Verifique seu e-mail e senha.";
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "Por favor, confirme seu email antes de fazer login.";
      }
      
      toast({
        variant: "destructive",
        title: "Erro ao fazer login",
        description: errorMessage,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Cadastro de usuários com inclusão automática dos dados no perfil
  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName, // This will be used by the trigger to create the profile
            terms_accepted: true,
            terms_accepted_at: new Date().toISOString(),
          },
        },
      });
      
      if (error) throw error;
      
      toast({
        title: "Conta criada com sucesso",
        description: "Você pode fazer login agora",
      });
      
      navigate('/login');
    } catch (error: any) {
      let errorMessage = error.message || "Ocorreu um problema ao criar sua conta";
      
      if (error.message.includes("already registered")) {
        errorMessage = "Este email já está registrado. Tente fazer login.";
      }
      
      toast({
        variant: "destructive",
        title: "Erro ao criar conta",
        description: errorMessage,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      // Limpa o cache ao fazer logout
      cacheService.clear();
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao fazer logout",
        description: error.message || "Ocorreu um problema ao desconectar",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast({
        title: "Email enviado",
        description: "Verifique sua caixa de entrada para redefinir sua senha",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao enviar email",
        description: error.message || "Não foi possível enviar o email de recuperação",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) throw error;
      
      toast({
        title: "Senha atualizada",
        description: "Sua senha foi atualizada com sucesso",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar senha",
        description: error.message || "Não foi possível atualizar sua senha",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData: Partial<Profile>) => {
    if (!user) return;
    
    try {
      setLoading(true);
      const updates = {
        id: user.id,
        full_name: profileData.full_name, // Corrigido
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (error) throw error;

      // Atualiza o perfil em cache
      if (profile) {
        const updatedProfile = {
          ...profile,
          ...profileData,
          updated_at: new Date().toISOString()
        };
        
        setProfile(updatedProfile);
        // Atualiza o cache
        cacheService.set(`profile_${user.id}`, updatedProfile, 600);
      }
      
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar perfil",
        description: error.message || "Ocorreu um erro ao atualizar seu perfil",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
