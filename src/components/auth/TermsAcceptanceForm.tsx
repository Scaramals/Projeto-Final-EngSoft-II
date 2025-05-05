
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

interface TermsAcceptanceFormProps {
  userId: string;
  onAccepted: () => void;
}

export const TermsAcceptanceForm: React.FC<TermsAcceptanceFormProps> = ({ userId, onAccepted }) => {
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAccept = async () => {
    if (!accepted) {
      setError("Você precisa aceitar os termos e condições para continuar.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Custom metadata for terms acceptance that will be stored separately
      const metadata = {
        terms_accepted: true,
        terms_accepted_at: new Date().toISOString()
      };
      
      // Update only the profile fields that exist in the profiles table
      const { error } = await supabase
        .from('profiles')
        .update({ 
          updated_at: new Date().toISOString(),
          // Store terms acceptance info in metadata if needed
          metadata: metadata
        })
        .eq('id', userId);
      
      if (error) throw error;

      toast({
        title: "Termos aceitos",
        description: "Obrigado por aceitar os termos e condições."
      });

      onAccepted();
    } catch (err) {
      console.error("Erro ao registrar aceite dos termos:", err);
      setError("Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Termos e Condições</CardTitle>
          <CardDescription>
            Por favor, leia e aceite os termos e condições para continuar usando o sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border rounded-md p-4 h-64 overflow-y-auto text-sm">
            <h3 className="font-medium mb-2">1. Aceitação dos Termos</h3>
            <p className="mb-4">
              Ao acessar ou usar o Sistema de Controle de Estoque StockControl, você concorda em 
              cumprir e ficar vinculado a estes Termos e Condições. Se você não concordar com 
              qualquer parte destes termos, não poderá usar o serviço.
            </p>
            
            <h3 className="font-medium mb-2">2. Uso do Serviço</h3>
            <p className="mb-4">
              O serviço é fornecido para auxiliar no controle e gerenciamento de estoque. 
              Você é responsável por manter a confidencialidade de sua conta e senha, e por 
              restringir o acesso ao seu computador e dispositivos. Você concorda em aceitar a 
              responsabilidade por todas as atividades que ocorrem em sua conta.
            </p>
            
            <h3 className="font-medium mb-2">3. Privacidade e Dados</h3>
            <p className="mb-4">
              Respeitamos sua privacidade e estamos comprometidos em proteger seus dados pessoais. 
              Todas as informações coletadas são usadas apenas para fins de funcionamento do sistema 
              e não serão compartilhadas com terceiros sem seu consentimento.
            </p>
            
            <h3 className="font-medium mb-2">4. Limitação de Responsabilidade</h3>
            <p className="mb-4">
              O serviço é fornecido "como está" e "como disponível". Não garantimos que o serviço 
              será ininterrupto, oportuno, seguro ou livre de erros. Não seremos responsáveis por 
              quaisquer perdas ou danos resultantes do uso do sistema.
            </p>
            
            <h3 className="font-medium mb-2">5. Alterações nos Termos</h3>
            <p>
              Reservamo-nos o direito de modificar ou substituir estes termos a qualquer momento. É 
              sua responsabilidade verificar periodicamente os termos para alterações. O uso 
              continuado do serviço após quaisquer alterações constitui aceitação dos novos termos.
            </p>
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="accept" 
              checked={accepted}
              onCheckedChange={(checked) => setAccepted(checked === true)}
            />
            <Label htmlFor="accept" className="text-sm">
              Eu li e aceito os termos e condições
            </Label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleAccept} disabled={loading || !accepted}>
            {loading ? "Processando..." : "Continuar"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
