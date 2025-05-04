
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      setIsSubmitted(true);
      toast({
        title: "E-mail enviado",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao enviar e-mail",
        description: error.message || "Ocorreu um erro ao processar sua solicitação.",
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
            Recupere sua senha
          </h2>
          <p className="mb-6">
            Não se preocupe! Acontece com todos. Enviaremos um link para você
            redefinir sua senha e voltar ao controle do seu estoque.
          </p>
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="space-y-6 w-full max-w-md">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Esqueceu a senha?</h1>
            <p className="text-muted-foreground">
              {isSubmitted 
                ? "Enviamos um e-mail com instruções para redefinir sua senha." 
                : "Digite seu e-mail e enviaremos um link para redefinir sua senha."}
            </p>
          </div>
          
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
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
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Enviando..." : "Enviar link de recuperação"}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <Button 
                onClick={() => setIsSubmitted(false)} 
                variant="outline" 
                className="w-full"
              >
                Enviar novamente
              </Button>
            </div>
          )}
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Lembrou sua senha?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Voltar ao login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
