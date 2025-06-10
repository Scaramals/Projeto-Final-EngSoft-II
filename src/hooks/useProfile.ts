import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { cacheService } from "@/services/cacheService";

interface UseProfileOptions {
  onError?: (error: Error) => void;
  skipCache?: boolean;
}

/**
 * Hook para gerenciar o perfil do usuário com suporte a cache
 */
export function useProfile(userId?: string | null, options?: UseProfileOptions) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    async function fetchProfile() {
      try {
        setLoading(true);
        
        // Tenta buscar do cache primeiro se skipCache não for especificado
        if (!options?.skipCache) {
          const cachedProfile = cacheService.get<Profile>(`profile_${userId}`);
          if (cachedProfile) {
            setProfile(cachedProfile);
            setLoading(false);
            console.log("Profile loaded from cache:", cachedProfile);
            return;
          }
        }
        
        console.log("Fetching profile from supabase for userId:", userId);
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
            role: data.role as 'admin' | 'employee',
            created_at: data.created_at,
            updated_at: data.updated_at
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
        setError(error);
        
        if (options?.onError) {
          options.onError(error);
        } else {
          toast({
            variant: "destructive",
            title: "Erro ao carregar perfil",
            description: "Não foi possível carregar suas informações de perfil. Tente recarregar a página."
          });
        }
      } finally {
        setLoading(false);
      }
    }
    
    fetchProfile();
  }, [userId, options?.skipCache, toast]);
  
  // Função para forçar atualização do perfil
  const refreshProfile = async () => {
    if (!userId) return;
    
    // Limpa o cache para este usuário
    cacheService.delete(`profile_${userId}`);
    
    // Força carregamento novamente
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        const profileData: Profile = {
          id: data.id,
          full_name: data.full_name, // Corrigido
          role: data.role as 'admin' | 'employee',
          created_at: data.created_at,
          updated_at: data.updated_at
        };
        
        cacheService.set(`profile_${userId}`, profileData, 600);
        setProfile(profileData);
      } else {
        setProfile(null);
      }
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar perfil",
        description: "Não foi possível atualizar suas informações de perfil."
      });
    } finally {
      setLoading(false);
    }
  };
  
  return { profile, loading, error, setProfile, refreshProfile };
}
