
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Sparkles, Coffee, TrendingUp } from "lucide-react";

export const WelcomeMessage: React.FC = () => {
  const { user } = useAuth();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const getMotivationalMessage = () => {
    const messages = [
      "Vamos começar o dia com produtividade!",
      "Seu estoque está nas suas mãos.",
      "Organize, controle e prospere.",
      "Cada produto conta para o seu sucesso.",
      "Transforme dados em decisões inteligentes."
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  return (
    <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-none shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/20 rounded-full">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-foreground mb-1">
              {getGreeting()}, {user?.user_metadata?.full_name || "Admin"}! 
            </h2>
            <p className="text-muted-foreground text-sm">
              {getMotivationalMessage()}
            </p>
          </div>
          <div className="flex gap-2">
            <div className="p-2 bg-orange-100 rounded-full">
              <Coffee className="h-4 w-4 text-orange-600" />
            </div>
            <div className="p-2 bg-green-100 rounded-full">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
