
import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, Save } from "lucide-react";

const SettingsPage: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfileLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        email,
        data: { full_name: name }
      });

      if (error) throw error;
      
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar perfil",
        description: error.message || "Ocorreu um erro ao atualizar seu perfil."
      });
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Senhas não coincidem",
        description: "A nova senha e a confirmação não são iguais."
      });
      return;
    }

    setIsPasswordLoading(true);
    
    try {
      // Primeiro verifica a senha atual
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: await getCurrentUserEmail(),
        password: currentPassword,
      });

      if (signInError) {
        throw new Error("Senha atual incorreta");
      }

      // Depois atualiza para a nova senha
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      
      toast({
        title: "Senha atualizada",
        description: "Sua senha foi atualizada com sucesso."
      });
      
      // Limpa os campos de senha
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar senha",
        description: error.message || "Ocorreu um erro ao atualizar sua senha."
      });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  // Função auxiliar para obter o email do usuário atual
  const getCurrentUserEmail = async (): Promise<string> => {
    const { data } = await supabase.auth.getUser();
    return data.user?.email || "";
  };

  // Carrega os dados do usuário quando a página é montada
  React.useEffect(() => {
    const loadUserData = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setEmail(data.user.email || "");
        setName(data.user.user_metadata.full_name || "");
      }
    };
    
    loadUserData();
  }, []);

  return (
    <AppLayout>
      <div className="container py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie suas configurações de conta e preferências
          </p>
        </div>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card>
              <form onSubmit={handleProfileUpdate}>
                <CardHeader>
                  <CardTitle>Informações do Perfil</CardTitle>
                  <CardDescription>
                    Atualize suas informações pessoais
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo</Label>
                    <Input 
                      id="name" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Seu nome completo" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com" 
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isProfileLoading}>
                    <Save className="mr-2 h-4 w-4" />
                    {isProfileLoading ? "Salvando..." : "Salvar alterações"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="security">
            <Card>
              <form onSubmit={handlePasswordUpdate}>
                <CardHeader>
                  <CardTitle>Alterar Senha</CardTitle>
                  <CardDescription>
                    Atualize sua senha para manter sua conta segura
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Senha atual</Label>
                    <div className="relative">
                      <Input 
                        id="currentPassword" 
                        type={showPassword ? "text" : "password"}
                        value={currentPassword} 
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-2.5"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nova senha</Label>
                    <Input 
                      id="newPassword" 
                      type={showPassword ? "text" : "password"}
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                    <Input 
                      id="confirmPassword" 
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isPasswordLoading}>
                    {isPasswordLoading ? "Atualizando..." : "Atualizar senha"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Preferências de Notificações</CardTitle>
                <CardDescription>
                  Configure como você deseja receber notificações
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

export default SettingsPage;
