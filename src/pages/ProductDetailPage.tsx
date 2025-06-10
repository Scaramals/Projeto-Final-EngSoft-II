import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductForm } from "@/components/products/ProductForm";
import { StockMovementForm } from "@/components/inventory/StockMovementForm";
import { formatCurrency, formatDate, getStockStatus } from "@/lib/utils";
import { Edit, Trash2, Box, ArrowUpDown, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useProducts } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CategoryDisplay } from "@/components/products/CategoryDisplay";

const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("details");
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingMovement, setIsAddingMovement] = useState(false);
  
  // Get product data
  const { useProduct, useUpdateProduct, useDeleteProduct, useProductMovements } = useProducts();
  const { 
    data: product, 
    isLoading: loadingProduct,
    error: productError,
    refetch: refetchProduct
  } = useProduct(productId);
  
  // Get stock movements
  const {
    data: stockMovements = [],
    isLoading: loadingMovements,
    error: movementsError
  } = useProductMovements(productId);
  
  // Mutations
  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();
  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();
  
  const stockStatus = product ? getStockStatus(product.quantity, product.minimumStock) : { class: '', label: '' };
  
  console.log('🔍 [DETAIL] === ESTADO DA PÁGINA DE DETALHE ===');
  console.log('🔍 [DETAIL] Product ID:', productId);
  console.log('🔍 [DETAIL] Produto carregado:', product);
  console.log('🔍 [DETAIL] Estoque atual:', product?.quantity);
  console.log('🔍 [DETAIL] Loading?', loadingProduct);
  console.log('🔍 [DETAIL] Error?', productError);
  
  // Transform product data for ProductForm
  const getProductFormDefaultValues = () => {
    if (!product) return undefined;
    
    return {
      name: product.name,
      description: product.description,
      quantity: product.quantity,
      price: product.price,
      categoryId: product.categoryId,
      minimumStock: product.minimumStock,
      imageUrl: product.imageUrl,
      suppliers: product.suppliers?.map(supplier => supplier.id) || []
    };
  };

  const handleEditProduct = (updatedProduct: any) => {
    if (!product) return;
    
    updateProduct({
      id: product.id,
      ...updatedProduct
    }, {
      onSuccess: () => {
        setIsEditing(false);
        // Forçar atualização dos dados
        refetchProduct();
      }
    });
  };
  
  const handleAddMovement = () => {
    console.log('🎯 [DETAIL] === MOVIMENTAÇÃO ADICIONADA ===');
    console.log('🎯 [DETAIL] Fechando formulário e atualizando dados...');
    setIsAddingMovement(false);
    // Forçar atualização dos dados do produto
    refetchProduct();
  };
  
  const handleDeleteProduct = () => {
    if (!productId) return;
    
    deleteProduct(productId, {
      onSuccess: () => {
        navigate("/products");
      }
    });
  };

  // Handle loading and error states
  if (loadingProduct) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-1/3" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Skeleton className="h-64 w-full" />
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (productError || !product) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-destructive">Produto não encontrado</h1>
          <p className="text-muted-foreground mt-2">
            O produto que você está procurando não existe ou foi removido.
          </p>
          <Button className="mt-6" variant="default" onClick={() => navigate("/products")}>
            Voltar para Produtos
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {isEditing ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Editar Produto</h1>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <ProductForm
              defaultValues={getProductFormDefaultValues()}
              onSubmit={handleEditProduct}
              onCancel={() => setIsEditing(false)}
              isLoading={isUpdating}
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
              productId={product?.id || ''}
              onSubmit={handleAddMovement}
              onCancel={() => setIsAddingMovement(false)}
              currentStock={product?.quantity || 0}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">{product?.name || 'Carregando...'}</h1>
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
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. Isso excluirá permanentemente o produto 
                      "{product?.name}" e todos os dados associados.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteProduct}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? "Excluindo..." : "Excluir"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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
                          <CategoryDisplay categoryId={product.categoryId} />
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
                      {product.suppliers && product.suppliers.length > 0 && (
                        <div>
                          <p className="text-sm text-muted-foreground">Fornecedores</p>
                          <div className="space-y-2">
                            {product.suppliers.map((supplier) => (
                              <div key={supplier.id} className="bg-gray-50 p-2 rounded">
                                <p className="font-medium">{supplier.name}</p>
                                {supplier.cnpj && (
                                  <p className="text-sm text-muted-foreground">CNPJ: {supplier.cnpj}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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
                
                {loadingMovements ? (
                  <div className="p-6">
                    <Skeleton className="h-32 w-full" />
                  </div>
                ) : movementsError ? (
                  <div className="text-center p-6">
                    <p className="text-destructive">
                      Erro ao carregar movimentações
                    </p>
                    <Button className="mt-4" variant="outline" onClick={() => {
                      window.location.reload();
                    }}>
                      Tentar novamente
                    </Button>
                  </div>
                ) : (
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
                            Fornecedor
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
                            <td className="px-6 py-4 whitespace-nowrap">
                              {movement.supplierName || '-'}
                            </td>
                            <td className="px-6 py-4">
                              {movement.notes || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                
                {stockMovements.length === 0 && !loadingMovements && !movementsError && (
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
