
import React, { useState } from "react";
import { useCategories } from "@/hooks/useCategories";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
}

export const CategorySelect: React.FC<CategorySelectProps> = ({ value, onChange }) => {
  const { useAllCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } = useCategories();
  const { data: categories, isLoading, error, refetch } = useAllCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [formError, setFormError] = useState("");

  const resetForm = () => {
    setNewCategoryName("");
    setNewCategoryDescription("");
    setFormError("");
    setIsEditMode(false);
    setEditingCategory(null);
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      setFormError("Nome da categoria é obrigatório");
      return;
    }

    try {
      const newCategory = await createCategory.mutateAsync({
        name: newCategoryName.trim(),
        description: newCategoryDescription.trim() || undefined,
      });
      
      // Atualizar o estado local e selecionar a nova categoria
      onChange(newCategory.id);
      setIsDialogOpen(false);
      resetForm();
      
      // Refazer o fetch para garantir dados atualizados
      refetch();
    } catch (error) {
      setFormError("Erro ao criar categoria. Tente novamente.");
    }
  };

  const handleUpdateCategory = async () => {
    if (!newCategoryName.trim() || !editingCategory) {
      setFormError("Nome da categoria é obrigatório");
      return;
    }

    try {
      await updateCategory.mutateAsync({
        id: editingCategory.id,
        name: newCategoryName.trim(),
        description: newCategoryDescription.trim() || undefined,
      });
      
      setIsDialogOpen(false);
      resetForm();
      refetch();
    } catch (error) {
      setFormError("Erro ao atualizar categoria. Tente novamente.");
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta categoria?")) {
      try {
        await deleteCategory.mutateAsync(categoryId);
        if (value === categoryId) {
          onChange("");
        }
        refetch();
      } catch (error) {
        setFormError("Erro ao excluir categoria. Tente novamente.");
      }
    }
  };

  const startEdit = (category: any) => {
    setIsEditMode(true);
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setNewCategoryDescription(category.description || "");
    setIsDialogOpen(true);
  };

  const startCreate = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  // Handle value change to convert between empty string and no-category
  const handleValueChange = (newValue: string) => {
    if (newValue === "no-category") {
      onChange("");
    } else {
      onChange(newValue);
    }
  };

  // Convert empty string value to no-category for the select
  const selectValue = value === "" ? "no-category" : value;

  // Validação: verificar se os dados estão carregados
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-2 border rounded-md bg-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Carregando categorias...</span>
      </div>
    );
  }

  // Tratamento de erro na UI
  if (error) {
    return (
      <div className="space-y-2">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar categorias. 
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2"
              onClick={() => refetch()}
            >
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Evitar render condicional inseguro
  const safeCategories = categories || [];

  return (
    <div className="flex gap-2">
      <Select value={selectValue} onValueChange={handleValueChange}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="Selecione uma categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="no-category">Sem categoria</SelectItem>
          {safeCategories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              <div className="flex items-center justify-between w-full">
                <span>{category.name}</span>
                <div className="flex gap-1 ml-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEdit(category);
                    }}
                    className="h-6 w-6 p-0"
                  >
                    ✏️
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCategory(category.id);
                    }}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  >
                    🗑️
                  </Button>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={startCreate}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Categoria" : "Nova Categoria"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {formError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}
            
            <div>
              <Label htmlFor="category-name">Nome da categoria*</Label>
              <Input
                id="category-name"
                value={newCategoryName}
                onChange={(e) => {
                  setNewCategoryName(e.target.value);
                  if (formError) setFormError("");
                }}
                placeholder="Digite o nome da categoria"
                maxLength={100}
              />
            </div>
            
            <div>
              <Label htmlFor="category-description">Descrição</Label>
              <Textarea
                id="category-description"
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
                placeholder="Descrição opcional da categoria"
                maxLength={500}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={isEditMode ? handleUpdateCategory : handleCreateCategory}
                disabled={createCategory.isPending || updateCategory.isPending}
              >
                {(createCategory.isPending || updateCategory.isPending) && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                {isEditMode ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
