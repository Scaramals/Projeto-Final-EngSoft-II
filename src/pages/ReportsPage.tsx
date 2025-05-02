
import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download } from "lucide-react";
import { 
  formatCurrency, 
  formatDate, 
  generateMockProducts,
  generateMockStockMovements,
  getStockStatus
} from "@/lib/utils";

const ReportsPage: React.FC = () => {
  const [reportType, setReportType] = useState("stock");
  
  // Mock data that would be replaced by Supabase queries
  const products = generateMockProducts(20);
  const movements = generateMockStockMovements(30);
  
  const lowStockProducts = products
    .filter(p => p.quantity <= (p.minimumStock || 5))
    .sort((a, b) => a.quantity - b.quantity);
    
  const topSellingProducts = [...products]
    .sort((a, b) => {
      // Simulate selling data with the quantity
      const aSold = movements
        .filter(m => m.productId === a.id && m.type === 'out')
        .reduce((sum, m) => sum + m.quantity, 0);
      const bSold = movements
        .filter(m => m.productId === b.id && m.type === 'out')
        .reduce((sum, m) => sum + m.quantity, 0);
      return bSold - aSold;
    })
    .slice(0, 10);
  
  const handleExportReport = (type: string) => {
    // In a real application, generate and download a report
    console.log(`Exporting ${type} report...`);
    alert("Funcionalidade de exportação será implementada na integração com o backend");
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground">
            Visualize e exporte relatórios de seu estoque
          </p>
        </div>
        
        <Tabs defaultValue={reportType} onValueChange={setReportType}>
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="stock">Estoque</TabsTrigger>
              <TabsTrigger value="movements">Movimentações</TabsTrigger>
              <TabsTrigger value="sales">Vendas</TabsTrigger>
            </TabsList>
            
            <Button onClick={() => handleExportReport(reportType)}>
              <Download className="mr-2 h-4 w-4" />
              Exportar relatório
            </Button>
          </div>
          
          <TabsContent value="stock" className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Produtos com Estoque Crítico</h2>
                {lowStockProducts.length === 0 ? (
                  <p className="text-muted-foreground">Nenhum produto com estoque crítico</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Produto</th>
                          <th className="text-center py-2">Em Estoque</th>
                          <th className="text-right py-2">Mínimo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lowStockProducts.map((product) => {
                          const stockStatus = getStockStatus(product.quantity, product.minimumStock);
                          
                          return (
                            <tr key={product.id} className="border-b">
                              <td className="py-2">{product.name}</td>
                              <td className="text-center py-2">
                                <span className={`status-badge ${stockStatus.class}`}>
                                  {product.quantity}
                                </span>
                              </td>
                              <td className="text-right py-2">{product.minimumStock || 5}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
              
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Valor do Estoque por Categoria</h2>
                {/* Simplified chart without recharts for initial implementation */}
                <div className="space-y-3">
                  {Array.from(new Set(products.map(p => p.category))).map(category => {
                    const categoryProducts = products.filter(p => p.category === category);
                    const totalValue = categoryProducts.reduce((sum, p) => sum + p.price * p.quantity, 0);
                    const percentage = Math.round((totalValue / products.reduce((sum, p) => sum + p.price * p.quantity, 0)) * 100);
                    
                    return (
                      <div key={category}>
                        <div className="flex justify-between mb-1">
                          <span>{category || "Sem categoria"}</span>
                          <span className="font-medium">{formatCurrency(totalValue)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-inventory-blue h-2.5 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-muted-foreground text-right mt-1">
                          {percentage}% do valor total
                        </p>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
            
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Resumo do Estoque</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-muted-foreground">Total de Produtos</p>
                  <p className="text-3xl font-bold">{products.length}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-muted-foreground">Valor Total do Estoque</p>
                  <p className="text-3xl font-bold">
                    {formatCurrency(
                      products.reduce((sum, p) => sum + p.price * p.quantity, 0)
                    )}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-muted-foreground">Produtos com Estoque Baixo</p>
                  <p className="text-3xl font-bold">{lowStockProducts.length}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-muted-foreground">Categorias</p>
                  <p className="text-3xl font-bold">
                    {new Set(products.map(p => p.category)).size}
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="movements" className="space-y-6 pt-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Movimentações Recentes</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Produto</th>
                      <th className="text-left py-2">Tipo</th>
                      <th className="text-center py-2">Quantidade</th>
                      <th className="text-right py-2">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movements.slice(0, 15).map((movement) => {
                      const product = products.find(p => p.id === movement.productId);
                      
                      return (
                        <tr key={movement.id} className="border-b">
                          <td className="py-2">{product?.name || `Produto ${movement.productId.substring(0, 8)}`}</td>
                          <td className="py-2">
                            <span className={`status-badge ${
                              movement.type === 'in'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {movement.type === 'in' ? 'Entrada' : 'Saída'}
                            </span>
                          </td>
                          <td className="text-center py-2">{movement.quantity}</td>
                          <td className="text-right py-2">{formatDate(movement.date)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Resumo de Movimentações</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-muted-foreground">Total de Entradas</p>
                      <p className="text-xl font-bold">
                        {movements.filter(m => m.type === 'in').length} movimentações
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground">Quantidade</p>
                      <p className="text-xl font-bold">
                        {movements
                          .filter(m => m.type === 'in')
                          .reduce((sum, m) => sum + m.quantity, 0)} unidades
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-muted-foreground">Total de Saídas</p>
                      <p className="text-xl font-bold">
                        {movements.filter(m => m.type === 'out').length} movimentações
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground">Quantidade</p>
                      <p className="text-xl font-bold">
                        {movements
                          .filter(m => m.type === 'out')
                          .reduce((sum, m) => sum + m.quantity, 0)} unidades
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Movimentações por Período</h2>
                {/* Simple period chart placeholder */}
                <div className="h-40 flex items-center justify-center bg-gray-50 rounded-lg">
                  <p className="text-muted-foreground">
                    Gráfico de movimentações por período será implementado
                  </p>
                </div>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="sales" className="space-y-6 pt-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Produtos Mais Vendidos</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Produto</th>
                      <th className="text-center py-2">Quantidade Vendida</th>
                      <th className="text-right py-2">Valor Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topSellingProducts.map((product, index) => {
                      const soldQuantity = movements
                        .filter(m => m.productId === product.id && m.type === 'out')
                        .reduce((sum, m) => sum + m.quantity, 0);
                      
                      return (
                        <tr key={product.id} className="border-b">
                          <td className="py-2">
                            <div className="flex items-center">
                              <span className="mr-2 text-muted-foreground">{index + 1}.</span>
                              {product.name}
                            </div>
                          </td>
                          <td className="text-center py-2">{soldQuantity}</td>
                          <td className="text-right py-2">
                            {formatCurrency(soldQuantity * product.price)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Resumo de Vendas</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-muted-foreground">Total de Vendas</p>
                      <p className="text-xl font-bold">
                        {movements.filter(m => m.type === 'out').length} transações
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground">Valor Total</p>
                      <p className="text-xl font-bold">
                        {formatCurrency(
                          movements
                            .filter(m => m.type === 'out')
                            .reduce((sum, m) => {
                              const product = products.find(p => p.id === m.productId);
                              return sum + (product ? product.price * m.quantity : 0);
                            }, 0)
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Vendas por Categoria</h2>
                {/* Simple category chart placeholder */}
                <div className="space-y-3">
                  {Array.from(new Set(products.map(p => p.category))).map(category => {
                    const categoryProducts = products.filter(p => p.category === category);
                    const totalSales = movements
                      .filter(m => m.type === 'out' && categoryProducts.find(p => p.id === m.productId))
                      .reduce((sum, m) => {
                        const product = products.find(p => p.id === m.productId);
                        return sum + (product ? product.price * m.quantity : 0);
                      }, 0);
                      
                    const totalAllSales = movements
                      .filter(m => m.type === 'out')
                      .reduce((sum, m) => {
                        const product = products.find(p => p.id === m.productId);
                        return sum + (product ? product.price * m.quantity : 0);
                      }, 0);
                      
                    const percentage = Math.round((totalSales / totalAllSales) * 100) || 0;
                    
                    return (
                      <div key={category}>
                        <div className="flex justify-between mb-1">
                          <span>{category || "Sem categoria"}</span>
                          <span className="font-medium">{formatCurrency(totalSales)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-inventory-purple h-2.5 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-muted-foreground text-right mt-1">
                          {percentage}% das vendas totais
                        </p>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default ReportsPage;
