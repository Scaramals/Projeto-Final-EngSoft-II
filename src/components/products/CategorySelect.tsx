
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/hooks/useCategories";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthorization } from "@/hooks/useAuthorization";

interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
}

const categorySchema = z.object({
  name: z.string().min(2, "O nome precisa ter pelo menos 2 caracteres"),
  description: z.string().optional(),
});

export function CategorySelect({ value, onChange }: CategorySelectProps) {
  const { useAllCategories, useCreateCategory, useDeleteCategory } = useCategories();
  const { isAdmin, isDeveloper, isMaster } = useAuthorization();
  const { data: categories, isLoading } = useAllCategories();
  const createMutation = useCreateCategory();
  const deleteMutation = useDeleteCategory();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [categoryToDelete, setCategoryToDelete] = React.useState<{id: string, name: string} | null>(null);
  
  const canManageCategory = isAdmin() || isDeveloper() || isMaster();

  const form = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const handleCreateCategory = (data: { name: string; description?: string }) => {
    createMutation.mutate(data, {
      onSuccess: (newCategory) => {
        onChange(newCategory.name);
        setIsDialogOpen(false);
        form.reset();
      },
    });
  };

  const handleDeleteCategory = (categoryId: string, categoryName: string) => {
    setCategoryToDelete({ id: categoryId, name: categoryName });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (categoryToDelete) {
      deleteMutation.mutate(categoryToDelete.id, {
        onSuccess: () => {
          if (value === categoryToDelete.name) {
            onChange("");
          }
          setDeleteDialogOpen(false);
          setCategoryToDelete(null);
        },
      });
    }
  };

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione a categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories?.map((category) => (
              <div key={category.id} className="flex items-center justify-between group">
                <SelectItem value={category.name} className="flex-1">
                  {category.name}
                </SelectItem>
                {canManageCategory && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteCategory(category.id, category.name);
                    }}
                  >
                    <Trash2 className="h-3 w-3 text-red-500" />
                  </Button>
                )}
              </div>
            ))}
          </SelectContent>
        </Select>
        
        {canManageCategory && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setIsDialogOpen(true)}
          >
            <PlusCircle className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Categoria</DialogTitle>
            <DialogDescription>
              Adicione uma nova categoria para organizar seus produtos
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(handleCreateCategory)}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Categoria*</Label>
                <Input
                  id="name"
                  placeholder="Digite o nome da categoria"
                  {...form.register("name")}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descrição opcional da categoria"
                  {...form.register("description")}
                />
              </div>
            </div>
            
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Criando..." : "Criar categoria"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Categoria</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a categoria "{categoryToDelete?.name}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
