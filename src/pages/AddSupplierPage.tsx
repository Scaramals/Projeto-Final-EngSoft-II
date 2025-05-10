
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
      <div className="container py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/suppliers")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Fornecedores
          </Button>
          <h1 className="text-2xl font-bold">Adicionar Fornecedor</h1>
          <p className="text-muted-foreground">
            Cadastre um novo fornecedor no sistema
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Dados do Fornecedor</CardTitle>
            <CardDescription>
              Preencha os dados do novo fornecedor
            </CardDescription>
          </CardHeader>
          <CardContent>
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
