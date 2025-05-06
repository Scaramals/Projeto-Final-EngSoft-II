import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Search, UserPlus, Users, Plus, Pencil, Trash2, Tag, Code, Database } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthorization } from "@/hooks/useAuthorization";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface User {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
  created_at: string;
  last_sign_in_at?: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

const AdminPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  const { toast } = useToast();
  const { profile } = useAuth();
  const { isDeveloper } = useAuthorization();
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);

  // Check if the current user is an admin or developer
  const isAdmin = profile?.role === 'admin';
  const canAccessAdmin = isAdmin || isDeveloper();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // First fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) {
        throw profilesError;
      }

      // Then fetch auth users to get emails (if we have admin access)
      let emailsMap: Record<string, string> = {};

      // Format the data to match our User interface
      const formattedUsers = profiles.map((profile: any) => ({
        id: profile.id,
        email: emailsMap[profile.id] || '',
        full_name: profile.full_name,
        role: profile.role,
        created_at: profile.created_at,
        last_sign_in_at: undefined
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

  const fetchCategories = async () => {
    setCategoryLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      setCategories(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar categorias",
        description: error.message
      });
    } finally {
      setCategoryLoading(false);
    }
  };

  useEffect(() => {
    if (canAccessAdmin) {
      fetchUsers();
      fetchCategories();
    }
  }, [canAccessAdmin]);

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
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

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({
        variant: "destructive",
        title: "Nome da categoria obrigatório",
        description: "Por favor, insira um nome para a categoria."
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: newCategoryName.trim(),
          description: newCategoryDescription.trim() || null
        })
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Categoria criada",
        description: "A nova categoria foi adicionada com sucesso."
      });
      
      // Reset form and refresh categories
      setNewCategoryName("");
      setNewCategoryDescription("");
      setCategoryDialogOpen(false);
      fetchCategories();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao criar categoria",
        description: error.message
      });
    }
  };

  const handleUpdateCategory = async () => {
    if (!editCategory || !editCategory.name.trim()) {
      toast({
        variant: "destructive",
        title: "Nome da categoria obrigatório",
        description: "Por favor, insira um nome para a categoria."
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('categories')
        .update({
          name: editCategory.name.trim(),
          description: editCategory.description?.trim() || null
        })
        .eq('id', editCategory.id);
      
      if (error) throw error;
      
      toast({
        title: "Categoria atualizada",
        description: "A categoria foi atualizada com sucesso."
      });
      
      // Reset form and refresh categories
      setEditCategory(null);
      setCategoryDialogOpen(false);
      fetchCategories();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar categoria",
        description: error.message
      });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Categoria excluída",
        description: "A categoria foi excluída com sucesso."
      });
      
      // Refresh categories
      fetchCategories();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir categoria",
        description: error.message
      });
    }
  };

  // If user doesn't have admin access, show access denied message
  if (!canAccessAdmin) {
    return (
      <AppLayout>
        <div className="container py-6">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <h1 className="text-3xl font-bold mb-4">Acesso Negado</h1>
            <p className="text-muted-foreground mb-6">
              Você não tem permissão para acessar esta página.
            </p>
            <Button asChild>
              <a href="/dashboard">Voltar para o Dashboard</a>
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Administração</h1>
          <p className="text-muted-foreground">
            Gerencie usuários, categorias e configurações do sistema
          </p>
        </div>
        
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="categories">Categorias</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
            <TabsTrigger value="logs">Logs do Sistema</TabsTrigger>
            {isDeveloper() && (
              <TabsTrigger value="developer">Desenvolvedor</TabsTrigger>
            )}
          </TabsList>
          
          {/* Tab de Usuários */}
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
          
          {/* Tab de Categorias */}
          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Tag className="mr-2" />
                    Gerenciamento de Categorias
                  </div>
                  <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => {
                        setEditCategory(null);
                        setNewCategoryName("");
                        setNewCategoryDescription("");
                      }}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nova Categoria
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>{editCategory ? "Editar Categoria" : "Adicionar Nova Categoria"}</DialogTitle>
                        <DialogDescription>
                          {editCategory 
                            ? "Edite os detalhes da categoria existente." 
                            : "Adicione uma nova categoria para classificar seus produtos."}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nome da Categoria*</Label>
                          <Input 
                            id="name" 
                            value={editCategory ? editCategory.name : newCategoryName} 
                            onChange={(e) => {
                              if (editCategory) {
                                setEditCategory({...editCategory, name: e.target.value});
                              } else {
                                setNewCategoryName(e.target.value);
                              }
                            }} 
                            placeholder="Ex: Eletrônicos, Alimentos, etc." 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Descrição</Label>
                          <Textarea 
                            id="description" 
                            value={editCategory ? editCategory.description || "" : newCategoryDescription} 
                            onChange={(e) => {
                              if (editCategory) {
                                setEditCategory({...editCategory, description: e.target.value});
                              } else {
                                setNewCategoryDescription(e.target.value);
                              }
                            }} 
                            placeholder="Descrição opcional da categoria" 
                            rows={3}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={editCategory ? handleUpdateCategory : handleAddCategory}>
                          {editCategory ? "Atualizar" : "Adicionar"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
                <CardDescription>
                  Gerencie as categorias de produtos disponíveis no sistema
                </CardDescription>
                <div className="relative mt-4">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome da categoria"
                    className="pl-8"
                    value={categorySearchTerm}
                    onChange={(e) => setCategorySearchTerm(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                {categoryLoading ? (
                  <div className="py-8 text-center">Carregando categorias...</div>
                ) : (
                  <>
                    {filteredCategories.length === 0 ? (
                      <Alert variant="default" className="bg-muted/50">
                        <AlertDescription>
                          Nenhuma categoria encontrada. Adicione uma nova categoria para começar.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Descrição</TableHead>
                            <TableHead>Criada em</TableHead>
                            <TableHead className="w-[100px]">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredCategories.map((category) => (
                            <TableRow key={category.id}>
                              <TableCell className="font-medium">{category.name}</TableCell>
                              <TableCell>{category.description || 'N/A'}</TableCell>
                              <TableCell>
                                {new Date(category.created_at).toLocaleDateString('pt-BR')}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => {
                                      setEditCategory(category);
                                      setCategoryDialogOpen(true);
                                    }}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="text-destructive hover:text-destructive/90"
                                    onClick={() => handleDeleteCategory(category.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Tab de Configurações */}
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
          
          {/* Tab de Logs */}
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
          
          {/* Developer Tab - Only visible to developers */}
          {isDeveloper() && (
            <TabsContent value="developer">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Code className="mr-2" />
                    Área do Desenvolvedor
                  </CardTitle>
                  <CardDescription>
                    Ferramentas avançadas para configuração e desenvolvimento do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card className="bg-background/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                          <Database className="mr-2 h-5 w-5" /> Gerenciamento de Banco de Dados
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          Ferramentas para gerenciar diretamente o banco de dados do sistema.
                        </p>
                        <div className="flex flex-col space-y-2">
                          <Button variant="outline" className="justify-start">
                            Visualizar Estrutura do BD
                          </Button>
                          <Button variant="outline" className="justify-start">
                            Executar Query SQL
                          </Button>
                          <Button variant="outline" className="justify-start">
                            Backup de Dados
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-background/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                          <Code className="mr-2 h-5 w-5" /> Configurações Avançadas
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          Opções avançadas para administração do sistema.
                        </p>
                        <div className="flex flex-col space-y-2">
                          <Button variant="outline" className="justify-start">
                            Gerenciar API Tokens
                          </Button>
                          <Button variant="outline" className="justify-start">
                            Configurar Integrações
                          </Button>
                          <Button variant="outline" className="justify-start" variant="destructive">
                            Modo de Manutenção
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card className="bg-background/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Logs do Sistema</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted p-3 rounded-md text-xs font-mono h-48 overflow-y-auto">
                        <p className="text-green-500">[INFO] Sistema iniciado corretamente</p>
                        <p className="text-blue-500">[DEBUG] Conexão com banco de dados estabelecida</p>
                        <p className="text-yellow-500">[WARN] Uso de memória acima de 70%</p>
                        <p className="text-muted-foreground">[INFO] 3 novos usuários registrados nas últimas 24h</p>
                        <p className="text-red-500">[ERROR] Falha ao processar backup automático</p>
                        <p className="text-muted-foreground">[INFO] 27 produtos com estoque baixo</p>
                      </div>
                      <div className="flex justify-end mt-2">
                        <Button variant="outline" size="sm">Ver Todos os Logs</Button>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default AdminPage;
