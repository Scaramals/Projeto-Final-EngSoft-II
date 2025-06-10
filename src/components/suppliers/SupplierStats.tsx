
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useSupplierMovements } from '@/hooks/useSupplierMovements';
import { Package, TrendingDown, Loader2 } from 'lucide-react';

export const SupplierStats: React.FC = () => {
  const { useAllSuppliers } = useSuppliers();
  const { data: suppliers = [], isLoading: loadingSuppliers } = useAllSuppliers();
  const { supplierMovements, isLoading: loadingMovements } = useSupplierMovements();

  if (loadingSuppliers || loadingMovements) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Estatísticas de Fornecedores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Carregando estatísticas...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Estatísticas de Fornecedores
        </CardTitle>
        <CardDescription>
          Produtos por fornecedor e movimentações de saída
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Total de Fornecedores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{suppliers.length}</div>
              <div className="text-sm text-blue-800">Total de Fornecedores</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {supplierMovements.reduce((sum, supplier) => sum + supplier.totalOut, 0)}
              </div>
              <div className="text-sm text-green-800">Total de Produtos Enviados</div>
            </div>
          </div>

          {/* Lista de Fornecedores com Movimentações */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Top Fornecedores por Saídas
            </h4>
            {supplierMovements.length > 0 ? (
              supplierMovements.map((supplier) => (
                <div
                  key={supplier.supplierId}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="font-medium">{supplier.supplierName}</div>
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    {supplier.totalOut} produtos enviados
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma movimentação de saída registrada ainda</p>
              </div>
            )}
          </div>

          {/* Fornecedores sem Movimentação */}
          {suppliers.length > supplierMovements.length && (
            <div className="space-y-3 pt-4 border-t">
              <h4 className="font-semibold text-muted-foreground">
                Fornecedores sem Movimentação
              </h4>
              {suppliers
                .filter(supplier => 
                  !supplierMovements.some(movement => movement.supplierId === supplier.id)
                )
                .map((supplier) => (
                  <div
                    key={supplier.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-muted-foreground">{supplier.name}</div>
                    </div>
                    <Badge variant="outline">
                      Sem movimentação
                    </Badge>
                  </div>
                ))
              }
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
