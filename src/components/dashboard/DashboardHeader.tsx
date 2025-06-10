
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface DashboardHeaderProps {
  onRefresh: () => void;
  isLoading: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onRefresh,
  isLoading
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Visão geral do seu estoque e operações em tempo real
        </p>
      </div>
      <Button 
        onClick={onRefresh} 
        disabled={isLoading}
        size="sm"
        className="w-full sm:w-auto"
      >
        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
        Atualizar
      </Button>
    </div>
  );
};
