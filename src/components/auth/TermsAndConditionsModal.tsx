
import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

interface TermsAndConditionsModalProps {
  open: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export const TermsAndConditionsModal: React.FC<TermsAndConditionsModalProps> = ({
  open,
  onAccept,
  onDecline
}) => {
  const [accepted, setAccepted] = React.useState(false);
  
  const handleAccept = () => {
    if (accepted) {
      onAccept();
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) onDecline();
    }}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Termos e Condições de Uso</DialogTitle>
          <DialogDescription>
            Por favor, leia atentamente os termos e condições antes de continuar.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[50vh] mt-4">
          <div className="p-4 space-y-4">
            <h3 className="font-bold">1. Aceitação dos Termos</h3>
            <p className="text-sm">
              Ao utilizar o StockControl, você concorda em cumprir estes termos de serviço. 
              Por favor, leia-os cuidadosamente. Se você não concordar com estes termos, 
              por favor, não utilize o sistema.
            </p>
            
            <h3 className="font-bold">2. Descrição do Serviço</h3>
            <p className="text-sm">
              O StockControl é um sistema de controle de estoque que permite o gerenciamento
              de produtos, movimentações, relatórios e mais. As funcionalidades do sistema
              podem mudar a qualquer momento sem aviso prévio.
            </p>
            
            <h3 className="font-bold">3. Responsabilidades do Usuário</h3>
            <p className="text-sm">
              O usuário é responsável por todas as atividades realizadas em sua conta e por
              manter a confidencialidade de suas credenciais de acesso. Em caso de uso não
              autorizado da sua conta, você deve notificar imediatamente a administração do sistema.
            </p>
            
            <h3 className="font-bold">4. Privacidade e Proteção de Dados</h3>
            <p className="text-sm">
              Respeitamos sua privacidade e nos comprometemos a proteger seus dados pessoais.
              Para mais informações sobre como coletamos, usamos e protegemos seus dados,
              consulte nossa Política de Privacidade.
            </p>
            
            <h3 className="font-bold">5. Limitação de Responsabilidade</h3>
            <p className="text-sm">
              Em nenhuma circunstância seremos responsáveis por quaisquer danos diretos, indiretos,
              incidentais, consequenciais ou punitivos resultantes do uso ou incapacidade de usar o sistema.
            </p>
            
            <h3 className="font-bold">6. Propriedade Intelectual</h3>
            <p className="text-sm">
              Todo o conteúdo do StockControl, incluindo, mas não limitado a, textos, gráficos,
              logotipos, ícones, imagens, clipes de áudio, downloads digitais e compilações de dados,
              são propriedade do StockControl ou de seus fornecedores de conteúdo e são protegidos
              por leis de propriedade intelectual.
            </p>
            
            <h3 className="font-bold">7. Alterações nos Termos</h3>
            <p className="text-sm">
              Reservamo-nos o direito de modificar estes termos de serviço a qualquer momento.
              As modificações entrarão em vigor imediatamente após a publicação dos termos revisados.
              Seu uso continuado do serviço após tais alterações constitui seu consentimento aos termos revisados.
            </p>
            
            <h3 className="font-bold">8. Encerramento</h3>
            <p className="text-sm">
              Podemos encerrar ou suspender seu acesso ao serviço imediatamente, sem aviso prévio
              ou responsabilidade, por qualquer motivo, incluindo, mas não se limitando à violação
              destes termos. Após o encerramento, seu direito de usar o serviço cessará imediatamente.
            </p>
            
            <h3 className="font-bold">9. Lei Aplicável</h3>
            <p className="text-sm">
              Estes termos serão regidos e interpretados de acordo com as leis do Brasil,
              independentemente de seus conflitos de princípios legais.
            </p>
            
            <h3 className="font-bold">10. Contato</h3>
            <p className="text-sm">
              Se você tiver alguma dúvida sobre estes termos, entre em contato conosco pelos
              canais de suporte disponíveis no sistema.
            </p>
          </div>
        </ScrollArea>
        
        <div className="flex items-center space-x-2 pt-4">
          <Checkbox 
            id="terms" 
            checked={accepted} 
            onCheckedChange={(checked) => setAccepted(!!checked)} 
          />
          <label
            htmlFor="terms"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Li e aceito os termos e condições
          </label>
        </div>
        
        <DialogFooter className="flex space-x-2 justify-between sm:justify-between">
          <Button variant="destructive" onClick={onDecline}>
            Recusar
          </Button>
          <Button 
            onClick={handleAccept} 
            disabled={!accepted}
          >
            Aceitar e Continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
