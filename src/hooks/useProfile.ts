
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
            return;
          }
        }
        
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle();
        
        if (error) throw error;
        
        if (data) {
          const profileData: Profile = {
            id: data.id,
            fullName: data.full_name,
            role: data.role as 'admin' | 'employee',
            createdAt: data.created_at,
            updatedAt: data.updated_at
          };
          
          // Armazena no cache por 5 minutos
          cacheService.set(`profile_${userId}`, profileData, 300);
          setProfile(profileData);
        } else {
          setProfile(null);
        }
      } catch (err) {
        const error = err as Error;
        setError(error);
        
        if (options?.onError) {
          options.onError(error);
        } else {
          toast({
            variant: "destructive",
            title: "Erro ao carregar perfil",
            description: "Não foi possível carregar suas informações de perfil."
          });
        }
      } finally {
        setLoading(false);
      }
    }
    
    fetchProfile();
  }, [userId, options?.skipCache, toast]);
  
  return { profile, loading, error, setProfile };
}
