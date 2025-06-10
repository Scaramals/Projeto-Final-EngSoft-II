
import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Package, TrendingDown } from "lucide-react";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useSupplierMovements } from "@/hooks/useSupplierMovements";
import { Skeleton } from "@/components/ui/skeleton";
import { SupplierStats } from "@/components/suppliers/SupplierStats";
import { useNavigate } from "react-router-dom";

const SuppliersPage: React.FC = () => {
  const navigate = useNavigate();
  const { useAllSuppliers } = useSuppliers();
  const { data: suppliers = [], isLoading: loadingSuppliers } = useAllSuppliers();
  const { supplierMovements, isLoading: loadingMovements } = useSupplierMovements();

  const handleAddSupplier = () => {
    navigate("/suppliers/add");
  };

  const handleSupplierClick = (supplierId: string) => {
    navigate(`/suppliers/${supplierId}`);
  };

  const getSupplierMovements = (supplierId: string) => {
    const movement = supplierMovements.find(m => m.supplierId === supplierId);
    return movement ? movement.totalOut : 0;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="h-8 w-8" />
              Fornecedores
            </h1>
            <p className="text-muted-foreground">
              Gerencie seus fornecedores e acompanhe as movimentações
            </p>
          </div>
          <Button onClick={handleAddSupplier} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Fornecedor
          </Button>
        </div>

        {/* Estatísticas dos Fornecedores */}
        <SupplierStats />

        {/* Lista de Fornecedores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Lista de Fornecedores
            </CardTitle>
            <CardDescription>
              Clique em um fornecedor para ver mais detalhes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingSuppliers ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array(6).fill(0).map((_, index) => (
                  <Skeleton key={index} className="h-32" />
                ))}
              </div>
            ) : suppliers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Nenhum fornecedor cadastrado</h3>
                <p className="text-muted-foreground mb-4">
                  Comece adicionando seu primeiro fornecedor
                </p>
                <Button onClick={handleAddSupplier} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Adicionar Fornecedor
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {suppliers.map((supplier) => {
                  const movementsCount = getSupplierMovements(supplier.id);
                  
                  return (
                    <Card
                      key={supplier.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleSupplierClick(supplier.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg">{supplier.name}</CardTitle>
                            {supplier.cnpj && (
                              <p className="text-sm text-muted-foreground">
                                CNPJ: {supplier.cnpj}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          {supplier.contactName && (
                            <p className="text-sm">
                              <span className="font-medium">Contato:</span> {supplier.contactName}
                            </p>
                          )}
                          {supplier.email && (
                            <p className="text-sm">
                              <span className="font-medium">Email:</span> {supplier.email}
                            </p>
                          )}
                          {supplier.phone && (
                            <p className="text-sm">
                              <span className="font-medium">Telefone:</span> {supplier.phone}
                            </p>
                          )}
                          
                          {/* Badge de movimentações */}
                          <div className="flex items-center gap-2 pt-2">
                            {loadingMovements ? (
                              <Skeleton className="h-6 w-24" />
                            ) : (
                              <Badge 
                                variant={movementsCount > 0 ? "default" : "secondary"}
                                className="flex items-center gap-1"
                              >
                                <TrendingDown className="h-3 w-3" />
                                {movementsCount} produtos enviados
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default SuppliersPage;
