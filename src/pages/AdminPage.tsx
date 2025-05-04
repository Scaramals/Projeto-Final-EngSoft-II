
import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Search, UserPlus, Users } from "lucide-react";

interface User {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
  created_at: string;
  last_sign_in_at?: string;
}

const AdminPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Query profiles table to get user data
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) {
        throw profilesError;
      }
      
      // Format the data to match our User interface
      const formattedUsers = profiles.map(profile => ({
        id: profile.id,
        email: '', // We don't have direct access to auth.users email
        full_name: profile.full_name,
        role: profile.role,
        created_at: profile.created_at,
        last_sign_in_at: undefined // We don't have this data without auth access
      }));
      
      setUsers(formattedUsers);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar usuários",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const changeUserRole = async (userId: string, newRole: string) => {
    try {
      // Update the role directly in the profiles table
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);
      
      if (error) throw error;
      
      // Update the local state to reflect the change
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
      toast({
        title: "Função atualizada",
        description: `A função do usuário foi alterada para ${newRole}.`
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar função",
        description: error.message
      });
    }
  };

  return (
    <AppLayout>
      <div className="container py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Administração</h1>
          <p className="text-muted-foreground">
            Gerencie usuários e configurações do sistema
          </p>
        </div>
        
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
            <TabsTrigger value="logs">Logs do Sistema</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Users className="mr-2" />
                    Gerenciamento de Usuários
                  </div>
                  <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Novo Usuário
                  </Button>
                </CardTitle>
                <CardDescription>
                  Visualize e gerencie todos os usuários do sistema
                </CardDescription>
                <div className="relative mt-4">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome ou email"
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="py-8 text-center">Carregando usuários...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Função</TableHead>
                        <TableHead>Criado em</TableHead>
                        <TableHead>Último login</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4">
                            Nenhum usuário encontrado
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>{user.full_name || 'N/A'}</TableCell>
                            <TableCell>{user.email || 'N/A'}</TableCell>
                            <TableCell>
                              <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
                                {user.role || 'usuário'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                            </TableCell>
                            <TableCell>
                              {user.last_sign_in_at 
                                ? new Date(user.last_sign_in_at).toLocaleDateString('pt-BR')
                                : 'Nunca'}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => changeUserRole(user.id, user.role === 'admin' ? 'employee' : 'admin')}
                                >
                                  {user.role === 'admin' ? 'Remover admin' : 'Tornar admin'}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Sistema</CardTitle>
                <CardDescription>
                  Configure parâmetros globais do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Esta funcionalidade será implementada em breve.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>Logs do Sistema</CardTitle>
                <CardDescription>
                  Visualize os registros de atividade do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Esta funcionalidade será implementada em breve.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default AdminPage;
