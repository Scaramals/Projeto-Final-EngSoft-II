
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, ArrowLeft, Mail, MapPin, Phone, User } from "lucide-react";
import { useSuppliers } from "@/hooks/useSuppliers";
import SupplierForm from "@/components/suppliers/SupplierForm";
import { SupplierFormData } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuthorization } from "@/hooks/useAuthorization";

const SupplierDetailPage = () => {
  const { supplierId } = useParams();
  const navigate = useNavigate();
  const { useSupplier, useUpdateSupplier } = useSuppliers();
  const { isAdmin, isDeveloper, isMaster } = useAuthorization();
  const { user } = useAuth();

  const {
    data: supplier,
    isLoading,
    error,
  } = useSupplier(supplierId);

  const updateMutation = useUpdateSupplier();
  const canEditSupplier = isAdmin() || isDeveloper() || isMaster();

  const handleSubmit = async (data: SupplierFormData) => {
    if (!supplierId) return;
    await updateMutation.mutateAsync({ id: supplierId, ...data });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container py-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/suppliers")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Fornecedores
          </Button>
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-7 w-1/4" />
                  <Skeleton className="h-4 w-1/3" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !supplier) {
    return (
      <AppLayout>
        <div className="container py-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/suppliers")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Fornecedores
          </Button>
          
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>
              {error ? `Erro ao carregar fornecedor: ${error.message}` : "Fornecedor não encontrado"}
            </AlertDescription>
          </Alert>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/suppliers")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Fornecedores
        </Button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{supplier.name}</h1>
            <p className="text-muted-foreground">
              Detalhes do fornecedor
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Informações de contato */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Informações de Contato</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {supplier.contactName && (
                  <div className="flex items-start space-x-2">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Nome do Contato</p>
                      <p>{supplier.contactName}</p>
                    </div>
                  </div>
                )}

                {supplier.email && (
                  <div className="flex items-start space-x-2">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p>{supplier.email}</p>
                    </div>
                  </div>
                )}

                {supplier.phone && (
                  <div className="flex items-start space-x-2">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Telefone</p>
                      <p>{supplier.phone}</p>
                    </div>
                  </div>
                )}

                {supplier.address && (
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Endereço</p>
                      <p>{supplier.address}</p>
                    </div>
                  </div>
                )}

                <Separator className="my-4" />

                <div>
                  <p className="text-sm text-muted-foreground">
                    Cadastrado em{" "}
                    {format(new Date(supplier.createdAt), "dd 'de' MMMM 'de' yyyy", {
                      locale: ptBR,
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Formulário de edição */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Editar Fornecedor</CardTitle>
              <CardDescription>
                Atualize os dados do fornecedor
              </CardDescription>
            </CardHeader>
            <CardContent>
              {canEditSupplier ? (
                <SupplierForm
                  defaultValues={{
                    name: supplier.name,
                    contactName: supplier.contactName || "",
                    email: supplier.email || "",
                    phone: supplier.phone || "",
                    address: supplier.address || "",
                    notes: supplier.notes || "",
                  }}
                  onSubmit={handleSubmit}
                  isLoading={updateMutation.isPending}
                />
              ) : (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                    <p className="text-amber-800">
                      Você não tem permissão para editar fornecedores. 
                      Apenas administradores podem realizar essa ação.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default SupplierDetailPage;
