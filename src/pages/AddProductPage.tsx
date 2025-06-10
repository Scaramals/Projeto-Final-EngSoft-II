
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProductForm } from "@/components/products/ProductForm";
import { useProducts } from "@/hooks/useProducts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { ProductFormData } from "@/types";

const AddProductPage: React.FC = () => {
  const navigate = useNavigate();
  const { useCreateProduct } = useProducts();
  const { mutate: createProduct, isPending: isLoading } = useCreateProduct();
  const [submitError, setSubmitError] = useState("");

  const handleAddProduct = async (productData: ProductFormData) => {
    try {
      setSubmitError("");
      
      // Convert ProductFormData to the format expected by the mutation
      const productToCreate = {
        name: productData.name,
        description: productData.description,
        quantity: productData.quantity,
        price: productData.price,
        categoryId: productData.categoryId, // Corrigido
        minimumStock: productData.minimumStock,
        imageUrl: productData.imageUrl,
      };
      
      await createProduct(productToCreate);
      navigate("/products");
    } catch (error: any) {
      setSubmitError(error?.message || "Erro ao criar produto. Tente novamente.");
    }
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
        
        {submitError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}
        
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
