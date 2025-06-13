
import React from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { Package, Github, Linkedin, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

const LoginPage: React.FC = () => {
  const { user, loading } = useAuth();

  // Redirect to dashboard if already logged in
  if (user && !loading) {
    return <Navigate to="/dashboard" replace />;
  }

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-md space-y-4 p-4">
          <Skeleton className="h-12 w-1/2 mx-auto" />
          <Skeleton className="h-4 w-3/4 mx-auto" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-background">
      {/* Left Panel - Enhanced with gradient and better typography */}
      <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 lg:w-1/2 flex items-center justify-center p-6 lg:p-8 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-grid-16" />
        <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        
        <div className="max-w-md text-primary-foreground text-center lg:text-left relative z-10">
          <div className="flex items-center justify-center lg:justify-start mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-3 mr-3">
              <Package size={32} className="text-white" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold">StockControl</h1>
          </div>
          
          <h2 className="text-xl lg:text-2xl font-bold mb-4 text-white/95">
            Sistema de Controle de Estoque
          </h2>
          
          <p className="mb-6 text-white/90 leading-relaxed">
            Gerencie seu estoque de forma eficiente com nosso sistema completo,
            ideal para pequenos e médios negócios.
          </p>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6">
            <ul className="space-y-3 text-left list-none">
              <li className="flex items-center text-white/90">
                <div className="w-2 h-2 bg-white/60 rounded-full mr-3 flex-shrink-0" />
                Cadastro e controle de produtos
              </li>
              <li className="flex items-center text-white/90">
                <div className="w-2 h-2 bg-white/60 rounded-full mr-3 flex-shrink-0" />
                Gerenciamento de estoque
              </li>
              <li className="flex items-center text-white/90">
                <div className="w-2 h-2 bg-white/60 rounded-full mr-3 flex-shrink-0" />
                Relatórios detalhados
              </li>
              <li className="flex items-center text-white/90">
                <div className="w-2 h-2 bg-white/60 rounded-full mr-3 flex-shrink-0" />
                Sistema de alertas e notificações
              </li>
            </ul>
          </div>

          {/* Developer Information */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-semibold text-white/95 mb-3">Desenvolvido por:</h3>
            
            <div className="space-y-2">
              <div className="flex items-center justify-center lg:justify-start">
                <span className="text-sm font-medium text-white/90">Vdev.0</span>
              </div>
              
              <div className="flex items-center justify-center lg:justify-start">
                <span className="text-sm text-white/80 mr-2">CEO:</span>
                <span className="text-sm font-medium text-white/90">Victor Pereira</span>
              </div>
            </div>
            
            <div className="flex items-center justify-center lg:justify-start gap-3 pt-2">
              <a 
                href="https://github.com/Vdev-0" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-white/80 hover:text-white transition-colors"
              >
                <Github size={14} />
                GitHub
              </a>
              
              <a 
                href="http://linkedin.com/in/victor-pereira-v2005/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-white/80 hover:text-white transition-colors"
              >
                <Linkedin size={14} />
                LinkedIn
              </a>
              
              <a 
                href="mailto:victorgabrielcapereira@gmail.com"
                className="flex items-center gap-1 text-xs text-white/80 hover:text-white transition-colors"
              >
                <Mail size={14} />
                Email
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-8 bg-background">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
