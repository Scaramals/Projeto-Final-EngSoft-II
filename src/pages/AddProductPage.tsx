
import React from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProductForm } from "@/components/products/ProductForm";
import { useProducts } from "@/hooks/useProducts";

const AddProductPage: React.FC = () => {
  const navigate = useNavigate();
  const { useCreateProduct } = useProducts();
  const { mutate: createProduct, isPending: isLoading } = useCreateProduct();

  const handleAddProduct = (productData: any) => {
    createProduct(productData, {
      onSuccess: () => {
        navigate("/products");
      }
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Novo Produto</h1>
          <p className="text-muted-foreground">
            Adicione um novo produto ao seu inventário
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <ProductForm
            onSubmit={handleAddProduct}
            onCancel={() => navigate("/products")}
            isLoading={isLoading}
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default AddProductPage;
