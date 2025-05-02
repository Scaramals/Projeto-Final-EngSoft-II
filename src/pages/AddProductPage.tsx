
import React from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProductForm } from "@/components/products/ProductForm";
import { useToast } from "@/components/ui/use-toast";
import { generateMockId } from "@/lib/utils";

const AddProductPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleAddProduct = (productData: any) => {
    setIsLoading(true);
    
    try {
      // In a real application, add the product to Supabase
      console.log("New product:", {
        ...productData,
        id: generateMockId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      
      toast({
        title: "Produto adicionado",
        description: "O produto foi criado com sucesso!",
      });
      
      navigate("/products");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao criar produto",
        description: "Ocorreu um erro ao tentar criar o produto.",
      });
    } finally {
      setIsLoading(false);
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
