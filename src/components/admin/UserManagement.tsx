
import React, { useState } from "react";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserCog, Trash2, Crown } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export const UserManagement = () => {
  const { users, isLoading, updateUserRole, deleteProfile } = useAdminUsers();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, newRole: string, isMaster: boolean) => {
    if (userId === currentUser?.id && newRole === 'employee') {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Você não pode rebaixar sua própria permissão para employee.",
      });
      return;
    }

    setUpdatingUserId(userId);
    try {
      await updateUserRole.mutateAsync({ userId, role: newRole, isMaster });
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === currentUser?.id) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Você não pode excluir sua própria conta.",
      });
      return;
    }

    await deleteProfile.mutateAsync(userId);
  };

  const getRoleBadgeVariant = (role: string, isMaster: boolean) => {
    if (isMaster) return "default";
    switch (role) {
      case 'admin': return "destructive";
      case 'developer': return "secondary";
      default: return "outline";
    }
  };

  const getRoleDisplayName = (role: string, isMaster: boolean) => {
    if (isMaster) return "Master";
    switch (role) {
      case 'admin': return "Administrador";
      case 'developer': return "Desenvolvedor";
      case 'employee': return "Funcionário";
      default: return role;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Carregando usuários...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCog className="h-5 w-5" />
          Gerenciamento de Usuários
        </CardTitle>
        <CardDescription>
          Gerencie permissões e controle de acesso dos usuários do sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Função</TableHead>
              <TableHead>Data de Cadastro</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.full_name || "Usuário sem nome"}
                  {user.id === currentUser?.id && (
                    <Badge variant="outline" className="ml-2">Você</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(user.role, user.is_master)}>
                    {user.is_master && <Crown className="h-3 w-3 mr-1" />}
                    {getRoleDisplayName(user.role, user.is_master)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(user.created_at).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Select
                      value={user.is_master ? 'master' : user.role}
                      onValueChange={(value) => {
                        const isMaster = value === 'master';
                        const role = isMaster ? 'admin' : value;
                        handleRoleChange(user.id, role, isMaster);
                      }}
                      disabled={updatingUserId === user.id || user.id === currentUser?.id}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employee">Funcionário</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="developer">Desenvolvedor</SelectItem>
                        <SelectItem value="master">Master</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={user.id === currentUser?.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir usuário</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir o usuário "{user.full_name}"? 
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteUser(user.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {!users || users.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum usuário encontrado
          </div>
        )}
      </CardContent>
    </Card>
  );
};
