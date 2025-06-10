
import { useState, useEffect, useCallback } from "react";
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

export function useAdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('Fetching users from profiles table...');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        throw new Error(`Error fetching users: ${error.message}`);
      }

      console.log('Users fetched:', data);
      setUsers(data as AdminUser[]);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        variant: "destructive",
        title: "Erro ao buscar usuários",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateUserRole = useCallback(async ({ userId, role, isMaster }: UpdateUserRoleData) => {
    setIsUpdating(true);
    try {
      console.log('Updating user role:', { userId, role, isMaster });
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

      console.log('User role updated successfully:', data);
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, role, is_master: isMaster }
            : user
        )
      );

      toast({
        title: "Usuário atualizado",
        description: "As permissões do usuário foram atualizadas com sucesso!",
      });

      return data;
    } catch (error: any) {
      console.error('Update user role error:', error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar usuário",
        description: error.message,
      });
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [toast]);

  const deleteProfile = useCallback(async (userId: string) => {
    setIsDeleting(true);
    try {
      console.log('Deleting profile:', userId);
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('Error deleting profile:', error);
        throw new Error(`Error deleting profile: ${error.message}`);
      }

      console.log('Profile deleted successfully');
      
      // Update local state
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));

      toast({
        title: "Usuário excluído",
        description: "O usuário foi removido com sucesso!",
      });

      return userId;
    } catch (error: any) {
      console.error('Delete profile error:', error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir usuário",
        description: error.message,
      });
      throw error;
    } finally {
      setIsDeleting(false);
    }
  }, [toast]);

  return {
    users,
    isLoading,
    updateUserRole: {
      mutateAsync: updateUserRole,
      isPending: isUpdating
    },
    deleteProfile: {
      mutateAsync: deleteProfile,
      isPending: isDeleting
    }
  };
}
