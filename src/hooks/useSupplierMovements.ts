
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SupplierMovement {
  supplierId: string;
  supplierName: string;
  totalOut: number;
}

export const useSupplierMovements = () => {
  const [supplierMovements, setSupplierMovements] = useState<SupplierMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSupplierMovements = async () => {
      try {
        console.log('🔍 Buscando movimentações por fornecedor...');
        
        const { data, error } = await supabase
          .from('stock_movements')
          .select(`
            supplier_id,
            quantity,
            type,
            suppliers!inner(name)
          `)
          .eq('type', 'out')
          .not('supplier_id', 'is', null);

        if (error) {
          console.error('❌ Erro ao buscar movimentações por fornecedor:', error);
          return;
        }

        // Agrupar por fornecedor
        const supplierMap = new Map<string, { name: string; totalOut: number }>();
        
        data?.forEach((movement: any) => {
          const supplierId = movement.supplier_id;
          const supplierName = movement.suppliers?.name || 'Fornecedor sem nome';
          const quantity = movement.quantity || 0;

          if (supplierMap.has(supplierId)) {
            const existing = supplierMap.get(supplierId)!;
            existing.totalOut += quantity;
          } else {
            supplierMap.set(supplierId, {
              name: supplierName,
              totalOut: quantity
            });
          }
        });

        // Converter para array e ordenar
        const movements = Array.from(supplierMap.entries())
          .map(([supplierId, data]) => ({
            supplierId,
            supplierName: data.name,
            totalOut: data.totalOut
          }))
          .sort((a, b) => b.totalOut - a.totalOut)
          .slice(0, 5); // Top 5

        console.log('✅ Movimentações por fornecedor:', movements);
        setSupplierMovements(movements);
      } catch (error) {
        console.error('❌ Erro ao processar movimentações por fornecedor:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSupplierMovements();
  }, []);

  return { supplierMovements, isLoading };
};
