
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Package, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the URL contains a hash fragment (indicating password reset flow)
    const hash = window.location.hash;
    if (!hash || !hash.includes("type=recovery")) {
      toast({
        variant: "destructive",
        title: "Link inválido",
        description: "O link de redefinição de senha é inválido ou expirou."
      });
      // Redirect to forgot password page after a brief delay
      setTimeout(() => navigate("/forgot-password"), 3000);
    }
  }, [navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Senhas não coincidem",
        description: "As senhas digitadas não são iguais. Tente novamente."
      });
      return;
    }

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres."
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        throw error;
      }

      toast({
        title: "Senha atualizada",
        description: "Sua senha foi atualizada com sucesso!"
      });
      
      // Redirect to login page after a brief delay
      setTimeout(() => navigate("/login"), 2000);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar senha",
        description: error.message || "Ocorreu um erro ao redefinir sua senha."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col sm:flex-row">
      <div className="bg-inventory-indigo sm:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md text-white text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start mb-6">
            <Package size={40} className="mr-2" />
            <h1 className="text-3xl font-bold">StockControl</h1>
          </div>
          <h2 className="text-2xl font-bold mb-4">
            Defina uma nova senha
          </h2>
          <p className="mb-6">
            Escolha uma senha forte para manter sua conta segura e retorne ao
            controle do seu estoque.
          </p>
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="space-y-6 w-full max-w-md">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Redefinir senha</h1>
            <p className="text-muted-foreground">
              Digite sua nova senha abaixo
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nova senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Atualizando..." : "Atualizar senha"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
