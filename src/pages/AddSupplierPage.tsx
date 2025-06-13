
import React from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import SupplierForm from "@/components/suppliers/SupplierForm";
import { useSuppliers } from "@/hooks/useSuppliers";
import { SupplierFormData } from "@/types";

const AddSupplierPage = () => {
  const navigate = useNavigate();
  const { useCreateSupplier } = useSuppliers();
  const createMutation = useCreateSupplier();

  const handleSubmit = async (data: SupplierFormData) => {
    await createMutation.mutateAsync(data);
    navigate("/suppliers");
  };

  return (
    <AppLayout>
      <div className="container max-w-4xl mx-auto py-4 sm:py-6 lg:py-8 px-4 sm:px-6">
        <div className="mb-4 sm:mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/suppliers")}
            className="mb-3 sm:mb-4 text-sm sm:text-base"
            size="sm"
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Voltar para Fornecedores
          </Button>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Adicionar Fornecedor</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Cadastre um novo fornecedor no sistema
          </p>
        </div>

        <Card className="w-full">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl">Dados do Fornecedor</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Preencha os dados do novo fornecedor
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <SupplierForm
              onSubmit={handleSubmit}
              isLoading={createMutation.isPending}
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default AddSupplierPage;
