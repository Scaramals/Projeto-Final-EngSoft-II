
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductForm } from "@/components/products/ProductForm";
import { StockMovementForm } from "@/components/inventory/StockMovementForm";
import { formatCurrency, formatDate, generateMockProducts, generateMockStockMovements, getStockStatus } from "@/lib/utils";
import { Edit, Trash2, Box, ArrowUpDown } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("details");
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingMovement, setIsAddingMovement] = useState(false);
  
  // In a real application, fetch the product from Supabase
  const mockProducts = generateMockProducts(20);
  const product = mockProducts.find(p => p.id === productId) || mockProducts[0];
  
  // Mock stock movements for this product
  const stockMovements = generateMockStockMovements(8).map(m => ({
    ...m,
    productId: product.id
  }));
  
  const stockStatus = getStockStatus(product.quantity, product.minimumStock);
  
  const handleEditProduct = (updatedProduct: any) => {
    // In a real application, update the product in Supabase
    console.log("Updated product:", updatedProduct);
    
    toast({
      title: "Produto atualizado",
      description: "As alterações foram salvas com sucesso!",
    });
    
    setIsEditing(false);
  };
  
  const handleAddMovement = (movementData: any) => {
    // In a real application, add the movement to Supabase
    console.log("New movement:", movementData);
    
    toast({
      title: "Movimentação registrada",
      description: `${movementData.type === 'in' ? 'Entrada' : 'Saída'} de ${movementData.quantity} unidades registrada com sucesso!`,
    });
    
    setIsAddingMovement(false);
  };
  
  const handleDeleteProduct = () => {
    // In a real application, delete the product from Supabase
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      console.log("Deleting product:", product.id);
      
      toast({
        title: "Produto excluído",
        description: "O produto foi removido com sucesso!",
      });
      
      navigate("/products");
    }
  };

  return (
    <AppLayout>
      {isEditing ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Editar Produto</h1>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <ProductForm
              initialData={product}
              onSubmit={handleEditProduct}
              onCancel={() => setIsEditing(false)}
              isLoading={false}
            />
          </div>
        </div>
      ) : isAddingMovement ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Registrar Movimentação</h1>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <StockMovementForm
              productId={product.id}
              onSubmit={handleAddMovement}
              onCancel={() => setIsAddingMovement(false)}
              isLoading={false}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <p className="text-muted-foreground">Detalhes do produto</p>
            </div>
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setIsAddingMovement(true)}
              >
                <ArrowUpDown className="mr-2 h-4 w-4" />
                Registrar Movimentação
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(true)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteProduct}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </Button>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="details">Detalhes</TabsTrigger>
              <TabsTrigger value="movements">Movimentações</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Informações do Produto</h2>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Descrição</p>
                        <p>{product.description || "Sem descrição"}</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Categoria</p>
                          <p>{product.category || "Não categorizado"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Preço</p>
                          <p className="font-semibold">{formatCurrency(product.price)}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Data de Criação</p>
                          <p>{formatDate(product.createdAt)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Última Atualização</p>
                          <p>{formatDate(product.updatedAt)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Estoque</h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">Quantidade atual</p>
                        <p className="font-bold text-2xl">{product.quantity}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <span className={`status-badge ${stockStatus.class}`}>
                          {stockStatus.label}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Estoque mínimo</p>
                        <p>{product.minimumStock || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Valor total</p>
                        <p className="font-semibold">{formatCurrency(product.price * product.quantity)}</p>
                      </div>
                      <Button 
                        className="w-full mt-4" 
                        onClick={() => setIsAddingMovement(true)}
                      >
                        <Box className="mr-2 h-4 w-4" />
                        Gerenciar Estoque
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="movements" className="space-y-6 pt-4">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Histórico de Movimentações</h2>
                  <Button onClick={() => setIsAddingMovement(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Movimentação
                  </Button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted text-muted-foreground">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Quantidade
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Data
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Observações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stockMovements.map((movement) => (
                        <tr key={movement.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`status-badge ${
                                movement.type === 'in'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {movement.type === 'in' ? 'Entrada' : 'Saída'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="font-medium">
                              {movement.quantity} unidades
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {formatDate(movement.date)}
                          </td>
                          <td className="px-6 py-4">
                            {movement.notes || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {stockMovements.length === 0 && (
                  <div className="text-center p-6">
                    <p className="text-muted-foreground">
                      Nenhuma movimentação registrada para este produto
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </AppLayout>
  );
};

export default ProductDetailPage;
