
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
      // Tenta buscar do cache primeiro
      const cachedProfile = cacheService.get<Profile>(`profile_${userId}`);
      if (cachedProfile) {
        setProfile(cachedProfile);
        return;
      }
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        console.log("No profile found for user, creating one...");
        // Considere criar um perfil padrão se nenhum existir
        return;
      }

      const profileData: Profile = {
        id: data.id,
        fullName: data.full_name,
        role: data.role as 'admin' | 'employee',
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      // Armazene o perfil em cache por 10 minutos
      cacheService.set(`profile_${userId}`, profileData, 600);
      
      setProfile(profileData);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar perfil",
        description: "Não foi possível carregar suas informações de perfil. Tente recarregar a página."
      });
    }
  };

  // Função para atualizar o perfil forçando refresh do cache
  const refreshProfile = async () => {
    if (!user) return;
    
    // Limpa o cache para este usuário
    cacheService.delete(`profile_${user.id}`);
    
    // Busca novamente
    await fetchUserProfile(user.id);
  };

  useEffect(() => {
    // Configurar listener de mudança de estado de autenticação primeiro
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        // Atualiza sessão e usuário de forma síncrona
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Adia busca de perfil com setTimeout para evitar deadlocks
        if (currentSession?.user) {
          setTimeout(() => {
            fetchUserProfile(currentSession.user.id);
          }, 0);
        } else {
          setProfile(null);
        }

        // Lida com eventos de autenticação
        if (event === 'SIGNED_IN') {
          navigate('/dashboard');
        } else if (event === 'SIGNED_OUT') {
          navigate('/login');
          // Limpa o cache ao fazer logout
          cacheService.clear();
        }
      }
    );

    // Verifica se há sessão existente
    const initializeAuth = async () => {
      try {
        setLoading(true);
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          
          // Busca dados do perfil do usuário
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

    // Função de limpeza
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

  // Cadastro de usuários com termos e condições
  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);
      // Adiciona o campo termsAccepted
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
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
        full_name: profileData.fullName,
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
          updatedAt: new Date().toISOString()
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
