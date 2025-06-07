
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSuppliers } from "@/hooks/useSuppliers";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, Plus, Search, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthorization } from "@/hooks/useAuthorization";

const SuppliersPage = () => {
  const { useAllSuppliers, useDeleteSupplier } = useSuppliers();
  const { isAdmin, isDeveloper, isMaster } = useAuthorization();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: suppliers, isLoading, error } = useAllSuppliers(search);
  const deleteMutation = useDeleteSupplier();

  const canManageSuppliers = isAdmin() || isDeveloper() || isMaster();

  const handleDelete = async () => {
    if (deleteId) {
      await deleteMutation.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  if (error) {
    return (
      <AppLayout>
        <div className="container max-w-7xl mx-auto py-4 sm:py-6 lg:py-8 px-4 sm:px-6">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <div className="flex items-center">
              <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
              <p className="text-red-700 text-sm sm:text-base">
                Erro ao carregar fornecedores: {error.message}
              </p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container max-w-7xl mx-auto py-4 sm:py-6 lg:py-8 px-4 sm:px-6">
        <div className="flex flex-col space-y-4 sm:space-y-6 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Fornecedores</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Gerencie seus fornecedores e contatos
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar fornecedor..."
                className="pl-8 text-sm sm:text-base"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {canManageSuppliers && (
              <Button 
                onClick={() => navigate("/suppliers/add")}
                className="w-full sm:w-auto text-sm sm:text-base"
                size="default"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Fornecedor
              </Button>
            )}
          </div>
        </div>

        <Card>
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl">Lista de Fornecedores</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              {suppliers && suppliers.length > 0
                ? `Mostrando ${suppliers.length} fornecedor${
                    suppliers.length > 1 ? "es" : ""
                  }`
                : "Nenhum fornecedor encontrado"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            {isLoading ? (
              // Loading skeleton
              <div className="space-y-4 p-4 sm:p-0">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-full" />
                  </div>
                ))}
              </div>
            ) : suppliers && suppliers.length > 0 ? (
              <div className="overflow-x-auto">
                {/* Mobile view - Card layout */}
                <div className="block sm:hidden space-y-4 p-4">
                  {suppliers.map((supplier) => (
                    <Card key={supplier.id} className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <Link
                            to={`/suppliers/${supplier.id}`}
                            className="font-medium text-blue-600 hover:underline text-sm"
                          >
                            {supplier.name}
                          </Link>
                        </div>
                        
                        {supplier.contactName && (
                          <p className="text-sm text-muted-foreground">
                            Contato: {supplier.contactName}
                          </p>
                        )}
                        
                        {supplier.email && (
                          <p className="text-sm text-muted-foreground">
                            {supplier.email}
                          </p>
                        )}
                        
                        {supplier.phone && (
                          <p className="text-sm text-muted-foreground">
                            {supplier.phone}
                          </p>
                        )}
                        
                        {supplier.address && (
                          <p className="text-sm text-muted-foreground">
                            {supplier.address}
                          </p>
                        )}
                        
                        {canManageSuppliers && (
                          <div className="flex space-x-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/suppliers/${supplier.id}`)}
                              className="flex-1 text-xs"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Editar
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setDeleteId(supplier.id)}
                              className="flex-1 text-xs"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Excluir
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Desktop view - Table layout */}
                <div className="hidden sm:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-sm font-medium">Nome</TableHead>
                        <TableHead className="text-sm font-medium">Contato</TableHead>
                        <TableHead className="text-sm font-medium">Email/Telefone</TableHead>
                        <TableHead className="text-sm font-medium">Endereço</TableHead>
                        {canManageSuppliers && <TableHead className="text-sm font-medium">Ações</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {suppliers.map((supplier) => (
                        <TableRow key={supplier.id}>
                          <TableCell className="font-medium">
                            <Link
                              to={`/suppliers/${supplier.id}`}
                              className="hover:underline text-blue-600 text-sm sm:text-base"
                            >
                              {supplier.name}
                            </Link>
                          </TableCell>
                          <TableCell className="text-sm sm:text-base">{supplier.contactName || "—"}</TableCell>
                          <TableCell>
                            {supplier.email && (
                              <div className="text-sm sm:text-base">{supplier.email}</div>
                            )}
                            {supplier.phone && (
                              <div className="text-xs sm:text-sm text-muted-foreground">
                                {supplier.phone}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-sm sm:text-base">{supplier.address || "—"}</TableCell>
                          {canManageSuppliers && (
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => navigate(`/suppliers/${supplier.id}`)}
                                  className="text-xs"
                                >
                                  Editar
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => setDeleteId(supplier.id)}
                                  className="text-xs"
                                >
                                  Excluir
                                </Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              // Empty state
              <div className="text-center py-8 px-4">
                <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                  Nenhum fornecedor encontrado
                </p>
                {canManageSuppliers && (
                  <Button onClick={() => navigate("/suppliers/add")} className="text-sm sm:text-base">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar fornecedor
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="mx-4 sm:mx-0 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Confirmar exclusão</DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              Tem certeza que deseja excluir este fornecedor? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              disabled={deleteMutation.isPending}
              className="w-full sm:w-auto text-sm sm:text-base"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="w-full sm:w-auto text-sm sm:text-base"
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default SuppliersPage;
