
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface AdminUser {
  id: string;
  full_name: string;
  role: string;
  is_master: boolean;
  created_at: string;
}

interface UpdateUserRoleData {
  userId: string;
  role: string;
  isMaster: boolean;
}

interface CreateProfileData {
  id: string;
  full_name: string;
  role: string;
}

export function useAdminUsers() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Buscar todos os usuários
  const users = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        throw new Error(`Error fetching users: ${error.message}`);
      }

      return data as AdminUser[];
    },
  });

  // Atualizar role do usuário
  const updateUserRole = useMutation({
    mutationFn: async ({ userId, role, isMaster }: UpdateUserRoleData) => {
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          role: role,
          is_master: isMaster 
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user role:', error);
        throw new Error(`Error updating user role: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: "Usuário atualizado",
        description: "As permissões do usuário foram atualizadas com sucesso!",
      });
    },
    onError: (error) => {
      console.error('Update user role error:', error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar usuário",
        description: error.message,
      });
    }
  });

  // Criar novo perfil
  const createProfile = useMutation({
    mutationFn: async ({ id, full_name, role }: CreateProfileData) => {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: id,
          full_name: full_name,
          role: role
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        throw new Error(`Error creating profile: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: "Usuário criado",
        description: "O usuário foi criado com sucesso!",
      });
    },
    onError: (error) => {
      console.error('Create profile error:', error);
      toast({
        variant: "destructive",
        title: "Erro ao criar usuário",
        description: error.message,
      });
    }
  });

  // Deletar perfil
  const deleteProfile = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('Error deleting profile:', error);
        throw new Error(`Error deleting profile: ${error.message}`);
      }

      return userId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: "Usuário excluído",
        description: "O usuário foi removido com sucesso!",
      });
    },
    onError: (error) => {
      console.error('Delete profile error:', error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir usuário",
        description: error.message,
      });
    }
  });

  return {
    users: users.data,
    isLoading: users.isLoading,
    updateUserRole,
    createProfile,
    deleteProfile
  };
}
