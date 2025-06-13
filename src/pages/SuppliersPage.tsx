
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useSuppliers } from "@/hooks/useSuppliers";
import { EditSupplierModal } from "@/components/suppliers/EditSupplierModal";
import { Link } from "react-router-dom";
import { Plus, Edit, Trash2, MoreVertical, Building2, Phone, Mail, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Supplier } from "@/types";

const SuppliersPage: React.FC = () => {
  const { useAllSuppliers, useDeleteSupplier } = useSuppliers();
  const { data: suppliers, isLoading, error } = useAllSuppliers();
  const deleteSupplier = useDeleteSupplier();
  
  const [editingSupplier, setEditingSupplier] = React.useState<Supplier | null>(null);
  const [deletingSupplier, setDeletingSupplier] = React.useState<Supplier | null>(null);

  const handleDelete = async () => {
    if (!deletingSupplier) return;

    try {
      await deleteSupplier.mutateAsync(deletingSupplier.id);
      setDeletingSupplier(null);
    } catch (error) {
      console.error('Erro ao excluir fornecedor:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <p className="text-destructive">Erro ao carregar fornecedores: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fornecedores</h1>
          <p className="text-muted-foreground">
            Gerencie seus fornecedores e mantenha suas informações atualizadas
          </p>
        </div>
        <Button asChild>
          <Link to="/suppliers/add">
            <Plus className="h-4 w-4 mr-2" />
            Novo Fornecedor
          </Link>
        </Button>
      </div>

      {suppliers && suppliers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum fornecedor cadastrado</h3>
            <p className="text-muted-foreground text-center mb-4">
              Comece adicionando seu primeiro fornecedor para gerenciar seus produtos.
            </p>
            <Button asChild>
              <Link to="/suppliers/add">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Fornecedor
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers?.map((supplier) => (
            <Card key={supplier.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">{supplier.name}</CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      CNPJ: {supplier.cnpj}
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingSupplier(supplier)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setDeletingSupplier(supplier)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {supplier.contactName && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{supplier.contactName}</span>
                  </div>
                )}
                {supplier.email && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{supplier.email}</span>
                  </div>
                )}
                {supplier.phone && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{supplier.phone}</span>
                  </div>
                )}
                {supplier.address && (
                  <div className="flex items-start text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="break-words">{supplier.address}</span>
                  </div>
                )}
                {supplier.notes && (
                  <div className="text-sm text-muted-foreground">
                    <p className="line-clamp-2">{supplier.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Supplier Modal */}
      <EditSupplierModal
        supplier={editingSupplier}
        isOpen={!!editingSupplier}
        onClose={() => setEditingSupplier(null)}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingSupplier} onOpenChange={() => setDeletingSupplier(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o fornecedor "{deletingSupplier?.name}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteSupplier.isPending}
            >
              {deleteSupplier.isPending ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SuppliersPage;
