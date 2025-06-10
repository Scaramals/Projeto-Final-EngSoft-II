
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { CategoryAnalysis } from "@/types";

interface CategoryAnalysisSectionProps {
  categoryAnalysis: CategoryAnalysis[] | undefined;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const CategoryAnalysisSection: React.FC<CategoryAnalysisSectionProps> = ({ categoryAnalysis }) => {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Análise de Categorias
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categoryAnalysis?.slice(0, 5).map((category, index) => (
            <div key={category.category_name} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <div>
                  <p className="font-medium">{category.category_name || 'Sem categoria'}</p>
                  <p className="text-sm text-muted-foreground">
                    {category.product_count} produtos • {category.total_quantity} unidades
                  </p>
                </div>
              </div>
              <Badge variant="secondary">
                R$ {Number(category.total_value).toLocaleString('pt-BR')}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
