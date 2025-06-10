
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown } from "lucide-react";

interface PerformanceSummaryProps {
  monthlyComparison: any;
}

export const PerformanceSummary: React.FC<PerformanceSummaryProps> = ({ monthlyComparison }) => {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Resumo de Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Entradas este mês</span>
              <div className="flex items-center gap-1">
                {monthlyComparison?.entriesGrowth >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm ${
                  monthlyComparison?.entriesGrowth >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {Math.abs(monthlyComparison?.entriesGrowth || 0).toFixed(1)}%
                </span>
              </div>
            </div>
            <Progress value={Math.min(Math.abs(monthlyComparison?.entriesGrowth || 0), 100)} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Saídas este mês</span>
              <div className="flex items-center gap-1">
                {monthlyComparison?.exitsGrowth >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-red-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-green-500" />
                )}
                <span className={`text-sm ${
                  monthlyComparison?.exitsGrowth >= 0 ? 'text-red-500' : 'text-green-500'
                }`}>
                  {Math.abs(monthlyComparison?.exitsGrowth || 0).toFixed(1)}%
                </span>
              </div>
            </div>
            <Progress value={Math.min(Math.abs(monthlyComparison?.exitsGrowth || 0), 100)} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Movimentações totais</span>
              <div className="flex items-center gap-1">
                {monthlyComparison?.movementsGrowth >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-blue-500" />
                )}
                <span className="text-sm text-blue-500">
                  {Math.abs(monthlyComparison?.movementsGrowth || 0).toFixed(1)}%
                </span>
              </div>
            </div>
            <Progress value={Math.min(Math.abs(monthlyComparison?.movementsGrowth || 0), 100)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
