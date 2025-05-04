
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, ArrowUpDown } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ReportFiltersProps {
  onFiltersChange: (filters: {
    search: string;
    category: string;
    sortBy?: string;
    sortDirection?: "asc" | "desc";
  }) => void;
  categories?: string[];
}

export const ReportFilters: React.FC<ReportFiltersProps> = ({
  onFiltersChange,
  categories = ["eletronica", "vestuario", "alimentacao"],
}) => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const { toast } = useToast();

  // Debounce search to avoid too many requests
  useEffect(() => {
    const timer = setTimeout(() => {
      applyFilters();
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Apply filters immediately when category or sort changes
  useEffect(() => {
    applyFilters();
  }, [category, sortBy, sortDirection]);

  const applyFilters = () => {
    onFiltersChange({
      search,
      category,
      sortBy,
      sortDirection,
    });
  };

  const toggleSortDirection = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-end">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
              aria-label="Buscar produtos"
            />
          </div>
        </div>

        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          onClick={toggleSortDirection}
          title={`Ordenar ${sortDirection === "asc" ? "Crescente" : "Decrescente"}`}
        >
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {search && (
          <div className="bg-muted text-sm rounded-full px-3 py-1 flex items-center gap-1">
            Busca: {search}
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 ml-1"
              onClick={() => {
                setSearch("");
              }}
            >
              ×
            </Button>
          </div>
        )}
        {category !== "all" && (
          <div className="bg-muted text-sm rounded-full px-3 py-1 flex items-center gap-1">
            Categoria: {category.charAt(0).toUpperCase() + category.slice(1)}
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 ml-1"
              onClick={() => {
                setCategory("all");
              }}
            >
              ×
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
