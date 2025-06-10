
import React, { useState, useEffect } from "react";
import { SystemIndicator, AlertsService } from "@/services/alertsService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

export const SystemIndicators: React.FC = () => {
  const [indicators, setIndicators] = useState<SystemIndicator[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchIndicators = async () => {
    try {
      const data = await AlertsService.getSystemIndicators();
      setIndicators(data);
    } catch (error) {
      console.error('Error fetching system indicators:', error);
      setIndicators([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIndicators();
    
    // Atualizar a cada 2 minutos
    const interval = setInterval(fetchIndicators, 2 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: SystemIndicator['status']) => {
    switch (status) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'warning':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'good':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTrendIcon = (direction: SystemIndicator['trend']['direction']) => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-3 h-3 text-red-600" />;
      case 'stable':
        return <Minus className="w-3 h-3 text-gray-600" />;
      default:
        return null;
    }
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === 'R$') {
      return formatCurrency(value);
    }
    return `${value.toLocaleString()} ${unit}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Indicadores do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-3 border rounded-lg">
                <Skeleton className="h-4 w-2/3 mb-2" />
                <Skeleton className="h-6 w-1/2 mb-1" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Indicadores do Sistema
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {indicators.map((indicator) => (
            <div
              key={indicator.id}
              className={`p-4 border rounded-lg ${getStatusColor(indicator.status)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">{indicator.name}</h4>
                <Badge 
                  variant="outline"
                  className={getStatusColor(indicator.status)}
                >
                  {indicator.status.toUpperCase()}
                </Badge>
              </div>
              
              <div className="mb-2">
                <p className="text-lg font-bold">
                  {formatValue(indicator.value, indicator.unit)}
                </p>
              </div>

              {indicator.trend && indicator.trend.percentage > 0 && (
                <div className="flex items-center gap-1 text-xs">
                  {getTrendIcon(indicator.trend.direction)}
                  <span>
                    {indicator.trend.percentage}% 
                    {indicator.trend.direction === 'up' ? ' ↑' : 
                     indicator.trend.direction === 'down' ? ' ↓' : ' →'}
                  </span>
                  <span className="text-muted-foreground ml-1">
                    vs mês anterior
                  </span>
                </div>
              )}

              {indicator.threshold && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Limite: {indicator.threshold.warning}% / {indicator.threshold.critical}%
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
