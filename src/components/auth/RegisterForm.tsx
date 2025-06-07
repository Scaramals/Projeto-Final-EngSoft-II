
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { TermsAndConditionsModal } from "./TermsAndConditionsModal";

export const RegisterForm: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signUp } = useAuth();
  const { toast } = useToast();

  const validateForm = () => {
    setError(null);
    
    if (!name || !email || !password || !confirmPassword) {
      setError("Por favor, preencha todos os campos.");
      return false;
    }
    
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return false;
    }
    
    if (password !== confirmPassword) {
      setError("As senhas não coincidem. Por favor, verifique.");
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Por favor, insira um email válido.");
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Mostrar os termos e condições
    setShowTerms(true);
  };
  
  const handleAcceptTerms = async () => {
    setShowTerms(false);
    setIsLoading(true);
    
    try {
      console.log('Starting signup process with:', { email, name });
      await signUp(email, password, name);
      
      toast({
        title: "Conta criada com sucesso",
        description: "Você pode fazer login agora."
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      setError(
        error.message === "User already registered"
          ? "Este email já está registrado. Tente fazer login."
          : error.message || "Ocorreu um erro durante o registro. Tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeclineTerms = () => {
    setShowTerms(false);
    toast({
      variant: "destructive",
      title: "Termos recusados",
      description: "Você precisa aceitar os termos para criar uma conta."
    });
  };

  return (
    <div className="space-y-6 w-full max-w-md">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Criar conta</h1>
        <p className="text-muted-foreground">
          Preencha os dados abaixo para criar sua conta
        </p>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome completo</Label>
          <Input
            id="name"
            type="text"
            placeholder="Seu nome completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar senha</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Criando conta...
            </>
          ) : (
            "Criar conta"
          )}
        </Button>
      </form>
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Já tem uma conta?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Faça login
          </Link>
        </p>
      </div>
      
      {/* Modal de Termos e Condições */}
      <TermsAndConditionsModal 
        open={showTerms}
        onAccept={handleAcceptTerms}
        onDecline={handleDeclineTerms}
      />
    </div>
  );
}
