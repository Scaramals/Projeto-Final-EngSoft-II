
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

interface ProductsHeaderProps {
  onRefresh: () => void;
}

export const ProductsHeader: React.FC<ProductsHeaderProps> = ({ onRefresh }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold">Produtos</h1>
        <p className="text-muted-foreground">
          Gerencie seu catálogo de produtos
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onRefresh}>
          Atualizar
        </Button>
        <Button asChild>
          <Link to="/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Novo Produto
          </Link>
        </Button>
      </div>
    </div>
  );
};
