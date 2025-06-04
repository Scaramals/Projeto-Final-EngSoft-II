
import React, { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useAuthorization } from "@/hooks/useAuthorization";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCog, Shield, AlertTriangle, Plus, Pencil, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface User {
  id: string;
  full_name: string;
  role: string;
  is_master: boolean;
  created_at: string;
}

const AdminPage = () => {
  const { isMaster, isDeveloper } = useAuthorization();
  const { users, isLoading, updateUserRole, createProfile, deleteProfile } = useProfile();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({ full_name: '', role: 'employee' });

  const canManageUsers = isMaster() || isDeveloper();

  if (!canManageUsers) {
    return (
      <AppLayout>
        <div className="container max-w-4xl mx-auto py-4 sm:py-6 lg:py-8 px-4 sm:px-6">
          <Card>
            <CardHeader className="text-center pb-4">
              <Shield className="h-12 w-12 mx-auto text-red-500 mb-4" />
              <CardTitle className="text-lg sm:text-xl">Acesso Negado</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Você não tem permissão para acessar esta página.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const handleUpdateRole = async () => {
    if (selectedUser) {
      await updateUserRole.mutateAsync({
        userId: selectedUser.id,
        role: selectedUser.role,
        isMaster: selectedUser.is_master,
      });
      setIsEditDialogOpen(false);
    }
  };

  const handleCreateUser = async () => {
    await createProfile.mutateAsync(newUser);
    setIsCreateDialogOpen(false);
    setNewUser({ full_name: '', role: 'employee' });
  };

  const handleDeleteUser = async () => {
    if (deleteUserId) {
      await deleteProfile.mutateAsync(deleteUserId);
      setDeleteUserId(null);
    }
  };

  return (
    <AppLayout>
      <div className="container max-w-7xl mx-auto py-4 sm:py-6 lg:py-8 px-4 sm:px-6">
        <div className="flex flex-col space-y-4 sm:space-y-6 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold flex items-center gap-2">
              <UserCog className="h-6 w-6 sm:h-8 sm:w-8" />
              Administração
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Gerencie usuários e permissões do sistema
            </p>
          </div>

          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="w-full sm:w-auto text-sm sm:text-base"
            size="default"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Usuário
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl">Usuários do Sistema</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              {users && users.length > 0
                ? `Mostrando ${users.length} usuário${users.length > 1 ? "s" : ""}`
                : "Nenhum usuário encontrado"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            {isLoading ? (
              <div className="space-y-4 p-4 sm:p-0">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-full" />
                  </div>
                ))}
              </div>
            ) : users && users.length > 0 ? (
              <div className="overflow-x-auto">
                {/* Mobile view - Card layout */}
                <div className="block sm:hidden space-y-4 p-4">
                  {users.map((user) => (
                    <Card key={user.id} className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-sm">{user.full_name}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {user.role}
                              {user.is_master && " (Master)"}
                            </p>
                          </div>
                        </div>
                        
                        <p className="text-xs text-muted-foreground">
                          Criado em: {new Date(user.created_at).toLocaleDateString('pt-BR')}
                        </p>
                        
                        <div className="flex space-x-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setIsEditDialogOpen(true);
                            }}
                            className="flex-1 text-xs"
                          >
                            <Pencil className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeleteUserId(user.id)}
                            className="flex-1 text-xs"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Desktop view - Table layout */}
                <div className="hidden sm:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-sm font-medium">Nome</TableHead>
                        <TableHead className="text-sm font-medium">Role</TableHead>
                        <TableHead className="text-sm font-medium">Status</TableHead>
                        <TableHead className="text-sm font-medium">Criado em</TableHead>
                        <TableHead className="text-sm font-medium">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium text-sm sm:text-base">
                            {user.full_name}
                          </TableCell>
                          <TableCell className="text-sm sm:text-base capitalize">
                            {user.role}
                          </TableCell>
                          <TableCell className="text-sm sm:text-base">
                            {user.is_master ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                                Master
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                Ativo
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm sm:text-base">
                            {new Date(user.created_at).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsEditDialogOpen(true);
                                }}
                                className="text-xs"
                              >
                                Editar
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setDeleteUserId(user.id)}
                                className="text-xs"
                              >
                                Excluir
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 px-4">
                <UserCog className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                  Nenhum usuário encontrado
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)} className="text-sm sm:text-base">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar usuário
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="mx-4 sm:mx-0 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Editar Usuário</DialogTitle>
              <DialogDescription className="text-sm sm:text-base">
                Altere as permissões do usuário {selectedUser?.full_name}
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="role" className="text-sm">Role</Label>
                  <Select
                    value={selectedUser.role}
                    onValueChange={(value) =>
                      setSelectedUser({ ...selectedUser, role: value })
                    }
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="developer">Developer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="w-full sm:w-auto text-sm sm:text-base"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleUpdateRole}
                disabled={updateUserRole.isPending}
                className="w-full sm:w-auto text-sm sm:text-base"
              >
                {updateUserRole.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create User Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="mx-4 sm:mx-0 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Novo Usuário</DialogTitle>
              <DialogDescription className="text-sm sm:text-base">
                Crie um novo usuário no sistema
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="full_name" className="text-sm">Nome Completo</Label>
                <Input
                  id="full_name"
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                  placeholder="Digite o nome completo"
                  className="text-sm"
                />
              </div>
              <div>
                <Label htmlFor="new_role" className="text-sm">Role</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="developer">Developer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                className="w-full sm:w-auto text-sm sm:text-base"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateUser}
                disabled={createProfile.isPending || !newUser.full_name}
                className="w-full sm:w-auto text-sm sm:text-base"
              >
                {createProfile.isPending ? "Criando..." : "Criar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete confirmation dialog */}
        <Dialog open={!!deleteUserId} onOpenChange={(open) => !open && setDeleteUserId(null)}>
          <DialogContent className="mx-4 sm:mx-0 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Confirmar exclusão
              </DialogTitle>
              <DialogDescription className="text-sm sm:text-base">
                Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setDeleteUserId(null)}
                disabled={deleteProfile.isPending}
                className="w-full sm:w-auto text-sm sm:text-base"
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteUser}
                disabled={deleteProfile.isPending}
                className="w-full sm:w-auto text-sm sm:text-base"
              >
                {deleteProfile.isPending ? "Excluindo..." : "Excluir"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default AdminPage;
