
import React from "react";
import { useAuthorization } from "@/hooks/useAuthorization";
import { AppLayout } from "@/components/layout/AppLayout";
import { UserManagement } from "@/components/admin/UserManagement";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserCog, Shield, Database, Settings, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";

const AdminPage = () => {
  const { isMaster, isDeveloper } = useAuthorization();
  const navigate = useNavigate();

  const canAccess = isMaster() || isDeveloper();

  if (!canAccess) {
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

  const adminModules = [
    {
      title: "Configurações do Sistema",
      description: "Configurar parâmetros gerais do sistema",
      icon: Settings,
      action: () => navigate("/settings"),
      color: "bg-blue-500"
    },
    {
      title: "Relatórios Avançados",
      description: "Visualizar relatórios detalhados e análises",
      icon: BarChart,
      action: () => navigate("/reports"),
      color: "bg-green-500"
    },
    {
      title: "Backup do Banco de Dados",
      description: "Gerenciar backups e restaurações",
      icon: Database,
      action: () => {
        console.log("Backup functionality");
      },
      color: "bg-purple-500"
    },
    {
      title: "Logs do Sistema",
      description: "Visualizar logs de atividades e erros",
      icon: UserCog,
      action: () => {
        console.log("System logs");
      },
      color: "bg-orange-500"
    }
  ];

  return (
    <AppLayout>
      <div className="container max-w-7xl mx-auto py-2 sm:py-4 lg:py-6 px-2 sm:px-4 lg:px-6">
        <div className="flex flex-col space-y-3 sm:space-y-4 lg:space-y-6 mb-4 sm:mb-6">
          <div>
            <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold flex items-center gap-2">
              <UserCog className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8" />
              Painel de Administração
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-muted-foreground mt-1">
              Gerencie configurações e monitore o sistema
            </p>
          </div>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="system">Sistema</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
          
          <TabsContent value="system">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {adminModules.map((module, index) => (
                <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-full ${module.color} text-white`}>
                        <module.icon className="h-6 w-6" />
                      </div>
                    </div>
                    <CardTitle className="text-base">{module.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {module.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={module.action}
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                    >
                      Acessar
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* System Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informações do Sistema</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Versão do Sistema</span>
                      <span className="text-sm text-muted-foreground">v2.1.0</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Banco de Dados</span>
                      <span className="text-sm text-green-600">✓ Conectado</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Último Backup</span>
                      <span className="text-sm text-muted-foreground">Hoje, 08:00</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Uptime</span>
                      <span className="text-sm text-muted-foreground">99.9%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Métricas de Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Tempo de Resposta</span>
                      <span className="text-sm text-green-600">&lt; 200ms</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Cache Hit Rate</span>
                      <span className="text-sm text-green-600">94.5%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Queries/min</span>
                      <span className="text-sm text-muted-foreground">1,247</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Erro Rate</span>
                      <span className="text-sm text-green-600">0.02%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Ações Rápidas</CardTitle>
                <CardDescription>
                  Executar tarefas administrativas comuns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Button variant="outline" size="sm" className="h-auto py-3">
                    <div className="flex flex-col items-center gap-2">
                      <Database className="h-5 w-5" />
                      <span className="text-xs">Backup</span>
                    </div>
                  </Button>
                  <Button variant="outline" size="sm" className="h-auto py-3">
                    <div className="flex flex-col items-center gap-2">
                      <BarChart className="h-5 w-5" />
                      <span className="text-xs">Relatórios</span>
                    </div>
                  </Button>
                  <Button variant="outline" size="sm" className="h-auto py-3">
                    <div className="flex flex-col items-center gap-2">
                      <Settings className="h-5 w-5" />
                      <span className="text-xs">Config</span>
                    </div>
                  </Button>
                  <Button variant="outline" size="sm" className="h-auto py-3">
                    <div className="flex flex-col items-center gap-2">
                      <UserCog className="h-5 w-5" />
                      <span className="text-xs">Logs</span>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default AdminPage;
