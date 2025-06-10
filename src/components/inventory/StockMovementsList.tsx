
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, TrendingDown, User, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Movement {
  id: string;
  product_name: string;
  quantity: number;
  type: 'in' | 'out';
  date: string;
  notes?: string;
  supplier_name?: string;
}

interface StockMovementsListProps {
  productId?: string;
  limit?: number;
}

export const StockMovementsList: React.FC<StockMovementsListProps> = ({
  productId,
  limit = 10
}) => {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMovements = async () => {
    try {
      let query = supabase
        .from('stock_movements')
        .select(`
          id,
          quantity,
          type,
          date,
          notes,
          products!inner(name),
          suppliers(name)
        `)
        .order('date', { ascending: false });

      if (productId) {
        query = query.eq('product_id', productId);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedMovements = (data || []).map(movement => ({
        id: movement.id,
        product_name: movement.products?.name || 'Produto não encontrado',
        quantity: movement.quantity,
        type: movement.type,
        date: movement.date,
        notes: movement.notes,
        supplier_name: movement.suppliers?.name
      })) as Movement[];

      setMovements(formattedMovements);
    } catch (error) {
      console.error('Erro ao buscar movimentações:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();

    // Escutar atualizações em tempo real
    const channel = supabase
      .channel('stock_movements_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stock_movements'
        },
        () => {
          console.log('📡 Movimentação atualizada via Realtime');
          fetchMovements();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [productId, limit]);

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
        <CardTitle>
          {productId ? 'Histórico de Movimentações' : 'Movimentações Recentes'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {movements.length > 0 ? (
            movements.map((movement) => (
              <div
                key={movement.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    movement.type === 'in' 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {movement.type === 'in' ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">{movement.product_name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDate(movement.date)}
                      {movement.supplier_name && (
                        <>
                          <User className="h-3 w-3" />
                          {movement.supplier_name}
                        </>
                      )}
                    </div>
                    {movement.notes && (
                      <p className="text-xs text-muted-foreground max-w-64 truncate">
                        {movement.notes}
                      </p>
                    )}
                  </div>
                </div>
                <Badge 
                  variant={movement.type === 'in' ? 'default' : 'destructive'}
                  className="ml-2"
                >
                  {movement.type === 'in' ? '+' : '-'}{movement.quantity}
                </Badge>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhuma movimentação encontrada</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
