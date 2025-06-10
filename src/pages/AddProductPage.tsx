
import React from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProductForm } from "@/components/products/ProductForm";
import { useProducts } from "@/hooks/useProducts";
import { ProductFormData } from "@/types";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const AddProductPage: React.FC = () => {
  const navigate = useNavigate();
  const { useCreateProduct } = useProducts();
  const createProduct = useCreateProduct();

  const handleAddProduct = async (productData: ProductFormData) => {
    try {
      const productToCreate = {
        name: productData.name,
        description: productData.description,
        quantity: productData.quantity,
        price: productData.price,
        categoryId: productData.categoryId,
        minimumStock: productData.minimumStock,
        imageUrl: productData.imageUrl,
      };
      
      await createProduct.mutateAsync(productToCreate);
      navigate("/products");
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate("/products")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Novo Produto</h1>
            <p className="text-muted-foreground">
              Adicione um novo produto ao seu inventário
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <ProductForm
            onSubmit={handleAddProduct}
            onCancel={() => navigate("/products")}
            isLoading={createProduct.isPending}
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default AddProductPage;
