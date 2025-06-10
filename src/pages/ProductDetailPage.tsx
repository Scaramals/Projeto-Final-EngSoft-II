
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { ProductForm } from "@/components/products/ProductForm";
import { CategoryBadge } from "@/components/products/CategoryBadge";
import { StockMovementModal } from "@/components/inventory/StockMovementModal";
import { StockMovementsList } from "@/components/inventory/StockMovementsList";
import { formatCurrency, formatDate, getStockStatus } from "@/lib/utils";
import { Edit, Trash2, ArrowLeft, Plus, TrendingUp } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useRealtimeStock } from "@/hooks/useRealtimeStock";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  
  const { useProduct, useUpdateProduct, useDeleteProduct } = useProducts();
  const { data: product, isLoading, error, refetch } = useProduct(productId);
  const { currentStock, refreshStock } = useRealtimeStock(productId);
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const handleEditProduct = async (updatedProduct: any) => {
    if (!product) return;
    
    try {
      await updateProduct.mutateAsync({
        id: product.id,
        ...updatedProduct
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };
  
  const handleDeleteProduct = async () => {
    if (!productId) return;
    
    try {
      await deleteProduct.mutateAsync(productId);
      navigate("/products");
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleMovementSuccess = () => {
    refetch();
    refreshStock();
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6 p-4 sm:p-6">
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

  if (error || !product) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-destructive">Produto não encontrado</h1>
          <p className="text-muted-foreground mt-2">
            O produto que você está procurando não existe ou foi removido.
          </p>
          <Button className="mt-6" onClick={() => navigate("/products")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Produtos
          </Button>
        </div>
      </AppLayout>
    );
  }

  // Usar estoque em tempo real se disponível, senão usar do produto
  const displayStock = currentStock !== undefined ? currentStock : product.quantity;
  const stockStatus = getStockStatus(displayStock, product.minimumStock);

  if (isEditing) {
    return (
      <AppLayout>
        <div className="space-y-6 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Editar Produto</h1>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <ProductForm
              defaultValues={{
                name: product.name,
                description: product.description,
                quantity: product.quantity,
                price: product.price,
                categoryId: product.categoryId,
                minimumStock: product.minimumStock,
                imageUrl: product.imageUrl,
              }}
              onSubmit={handleEditProduct}
              onCancel={() => setIsEditing(false)}
              isLoading={updateProduct.isPending}
            />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button variant="ghost" size="sm" onClick={() => navigate("/products")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-3xl font-bold">{product.name}</h1>
            </div>
            <p className="text-muted-foreground">Detalhes do produto</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowMovementModal(true)}
              className="bg-blue-50 hover:bg-blue-100 border-blue-200"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Movimentar Estoque
            </Button>
            <Button variant="outline" onClick={() => setIsEditing(true)}>
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
                    "{product.name}" e todos os dados associados.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteProduct}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleteProduct.isPending ? "Excluindo..." : "Excluir"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Informações do Produto</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Descrição</p>
                  <p>{product.description || "Sem descrição"}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Categoria</p>
                    <CategoryBadge categoryId={product.categoryId} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Preço</p>
                    <p className="font-semibold">{formatCurrency(product.price)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Data de Criação</p>
                    <p className="text-sm">{formatDate(product.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Última Atualização</p>
                    <p className="text-sm">{formatDate(product.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de movimentações do produto */}
            <StockMovementsList productId={productId} limit={20} />
          </div>
          
          <div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Estoque</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Quantidade atual</p>
                  <p className="font-bold text-2xl">{displayStock}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.class}`}>
                    {stockStatus.label}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estoque mínimo</p>
                  <p>{product.minimumStock || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valor total</p>
                  <p className="font-semibold">{formatCurrency(product.price * displayStock)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de movimentação */}
        <StockMovementModal
          isOpen={showMovementModal}
          onClose={() => setShowMovementModal(false)}
          productId={productId!}
          productName={product.name}
          currentStock={displayStock}
          onSuccess={handleMovementSuccess}
        />
      </div>
    </AppLayout>
  );
};

export default ProductDetailPage;
