import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Package, ArrowRight, BarChart3, Users, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
const Index = () => {
  const {
    user,
    loading
  } = useAuth();

  // Redirect authenticated users to dashboard
  if (user && !loading) {
    return <Navigate to="/dashboard" replace />;
  }

  // Show loading state
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>;
  }
  return <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/80">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-grid-16" />
        <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        
        <div className="relative z-10 container mx-auto px-4 py-16 lg:py-24">
          <div className="text-center text-primary-foreground">
            <div className="flex items-center justify-center mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-full p-4 mr-4">
                <Package size={48} className="text-white" />
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold">StockControl</h1>
            </div>
            
            <h2 className="text-xl lg:text-3xl font-bold mb-6 text-white/95">
              Sistema Completo de Gestão de Estoque
            </h2>
            
            <p className="text-lg lg:text-xl mb-8 text-white/90 max-w-2xl mx-auto leading-relaxed">
              Transforme a gestão do seu negócio com nossa plataforma intuitiva e poderosa.
              Controle total sobre produtos, fornecedores e movimentações em um só lugar.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold px-8 py-3" onClick={() => window.location.href = '/login'}>
                Começar Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button size="lg" variant="outline" onClick={() => window.location.href = '/register'} className="border-white/20 hover:bg-white/10 font-semibold px-8 py-3 text-sky-700">
                Criar Conta Grátis
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Por que escolher o StockControl?
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Desenvolvido com tecnologia de ponta para oferecer a melhor experiência em gestão de estoque
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
                <h4 className="text-xl font-semibold mb-4">Dashboard Inteligente</h4>
                <p className="text-muted-foreground">
                  Visualize métricas em tempo real, gráficos interativos e relatórios detalhados 
                  para tomar decisões estratégicas baseadas em dados.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h4 className="text-xl font-semibold mb-4">Gestão Completa</h4>
                <p className="text-muted-foreground">
                  Controle produtos, fornecedores, movimentações de estoque e 
                  muito mais em uma interface intuitiva e responsiva.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h4 className="text-xl font-semibold mb-4">Seguro e Confiável</h4>
                <p className="text-muted-foreground">
                  Seus dados protegidos com criptografia de ponta a ponta, 
                  backups automáticos e infraestrutura enterprise-grade.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Developer Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-6">
              Desenvolvido pela Vdev.0
            </h3>
            <p className="text-muted-foreground mb-8">
              Criado por Victor Pereira, CEO da Vdev.0, utilizando as mais modernas 
              tecnologias para entregar uma experiência excepcional.
            </p>
            
            <div className="flex justify-center gap-6">
              <a href="https://github.com/Vdev-0" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Package size={20} />
                <span>GitHub</span>
              </a>
              
              <a href="http://linkedin.com/in/victor-pereira-v2005/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Users size={20} />
                <span>LinkedIn</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl lg:text-3xl font-bold mb-4">
            Pronto para revolucionar sua gestão de estoque?
          </h3>
          <p className="text-lg mb-8 text-white/90">
            Comece gratuitamente e veja a diferença em poucos minutos
          </p>
          
          <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold px-8 py-3" onClick={() => window.location.href = '/register'}>
            Criar Conta Grátis
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>;
};
export default Index;