
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";

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

  const { data: recentMovements, isLoading } = useQuery({
    queryKey: ["recent-movements"],
    queryFn: async () => {
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
        throw error;
      }

      console.log('Recent movements data:', data);

      return (data || []).map(movement => ({
        id: movement.id,
        product_name: movement.products?.name || 'Produto desconhecido',
        quantity: movement.quantity,
        type: movement.type,
        date: movement.date,
        notes: movement.notes
      })) as RecentMovement[];
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    enabled: !!user,
  });

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
