
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
import { PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const { useAllCategories, useCreateCategory } = useCategories();
  const { isAdmin, isDeveloper, isMaster } = useAuthorization();
  const { data: categories, isLoading } = useAllCategories();
  const createMutation = useCreateCategory();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  
  const canCreateCategory = isAdmin() || isDeveloper() || isMaster();

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
              <SelectItem key={category.id} value={category.name}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {canCreateCategory && (
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
    </div>
  );
}
