
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
import { AlertTriangle, Plus, Search } from "lucide-react";
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
        <div className="container py-8">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <div className="flex items-center">
              <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
              <p className="text-red-700">
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
      <div className="container py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold">Fornecedores</h1>
            <p className="text-muted-foreground">
              Gerencie seus fornecedores e contatos
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar fornecedor..."
                className="pl-8 w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {canManageSuppliers && (
              <Button onClick={() => navigate("/suppliers/new")}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Fornecedor
              </Button>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Fornecedores</CardTitle>
            <CardDescription>
              {suppliers && suppliers.length > 0
                ? `Mostrando ${suppliers.length} fornecedor${
                    suppliers.length > 1 ? "es" : ""
                  }`
                : "Nenhum fornecedor encontrado"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              // Loading skeleton
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-full" />
                  </div>
                ))}
              </div>
            ) : suppliers && suppliers.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Email/Telefone</TableHead>
                      <TableHead>Endereço</TableHead>
                      {canManageSuppliers && <TableHead>Ações</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suppliers.map((supplier) => (
                      <TableRow key={supplier.id}>
                        <TableCell className="font-medium">
                          <Link
                            to={`/suppliers/${supplier.id}`}
                            className="hover:underline text-blue-600"
                          >
                            {supplier.name}
                          </Link>
                        </TableCell>
                        <TableCell>{supplier.contactName || "—"}</TableCell>
                        <TableCell>
                          {supplier.email && (
                            <div>{supplier.email}</div>
                          )}
                          {supplier.phone && (
                            <div className="text-sm text-muted-foreground">
                              {supplier.phone}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{supplier.address || "—"}</TableCell>
                        {canManageSuppliers && (
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  navigate(`/suppliers/${supplier.id}/edit`)
                                }
                              >
                                Editar
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setDeleteId(supplier.id)}
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
            ) : (
              // Empty state
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Nenhum fornecedor encontrado
                </p>
                {canManageSuppliers && (
                  <Button onClick={() => navigate("/suppliers/new")}>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este fornecedor? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              disabled={deleteMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
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
