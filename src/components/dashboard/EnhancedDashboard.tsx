
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useOptimizedDashboard } from "@/hooks/useOptimizedDashboard";
import { MovementsChart } from "./charts/MovementsChart";
import { CategoryPieChart } from "./charts/CategoryPieChart";
import { MonthlyTrendsChart } from "./charts/MonthlyTrendsChart";
import { PerformanceSummary } from "./sections/PerformanceSummary";
import { CategoryAnalysisSection } from "./sections/CategoryAnalysisSection";

export const EnhancedDashboard: React.FC = () => {
  const { 
    stats, 
    movementsSummary, 
    categoryAnalysis, 
    monthlyTrends,
    monthlyComparison,
    isLoading 
  } = useOptimizedDashboard();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array(6).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <MovementsChart movementsSummary={movementsSummary} />
      <CategoryPieChart categoryAnalysis={categoryAnalysis} />
      <MonthlyTrendsChart monthlyTrends={monthlyTrends} />
      <PerformanceSummary monthlyComparison={monthlyComparison} />
      <CategoryAnalysisSection categoryAnalysis={categoryAnalysis} />
    </div>
  );
};
