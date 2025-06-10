
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { SecureLogger } from "@/services/secureLogger";

interface RecentMovement {
  id: string;
  product_name: string;
  quantity: number;
  type: 'in' | 'out';
  date: string;
  notes?: string;
}

export const RecentMovementsSection: React.FC = () => {
  const { user } = useAuth();
  const [recentMovements, setRecentMovements] = useState<RecentMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecentMovements = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching recent movements...');
      const { data, error } = await supabase
        .from('stock_movements')
        .select(`
          id,
          quantity,
          type,
          date,
          notes,
          products!inner(name)
        `)
        .order('date', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching recent movements:', error);
        SecureLogger.error('Erro ao buscar movimentações recentes', error);
        throw error;
      }

      console.log('Recent movements data:', data);

      const movements = (data || []).map(movement => ({
        id: movement.id,
        product_name: movement.products?.name || 'Produto desconhecido',
        quantity: movement.quantity,
        type: movement.type,
        date: movement.date,
        notes: movement.notes
      })) as RecentMovement[];

      setRecentMovements(movements);
    } catch (error) {
      console.error('Error fetching recent movements:', error);
      SecureLogger.error('Erro ao buscar movimentações recentes', error);
      setError('Erro ao carregar movimentações');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentMovements();

    // Escutar eventos customizados para atualização
    const handleDataUpdate = () => {
      setTimeout(fetchRecentMovements, 1000); // Delay para permitir que os dados sejam salvos
    };

    window.addEventListener('dashboard-data-updated', handleDataUpdate);
    window.addEventListener('movements-updated', handleDataUpdate);

    return () => {
      window.removeEventListener('dashboard-data-updated', handleDataUpdate);
      window.removeEventListener('movements-updated', handleDataUpdate);
    };
  }, [user]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Movimentações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Movimentações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Movimentações Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentMovements && recentMovements.length > 0 ? (
            recentMovements.slice(0, 5).map((movement) => (
              <div key={movement.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    movement.type === 'in' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {movement.type === 'in' ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{movement.product_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(movement.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={movement.type === 'in' ? 'default' : 'destructive'}>
                    {movement.type === 'in' ? '+' : '-'}{movement.quantity}
                  </Badge>
                  {movement.notes && (
                    <p className="text-xs text-muted-foreground mt-1 max-w-32 truncate">
                      {movement.notes}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhuma movimentação recente encontrada</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
