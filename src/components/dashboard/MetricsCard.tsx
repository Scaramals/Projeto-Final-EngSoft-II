
import React, { useRef, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

interface MetricsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  badge?: {
    text: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
  };
  className?: string;
}

export const MetricsCard: React.FC<MetricsCardProps> = memo(({
  title,
  value,
  description,
  icon: Icon,
  trend,
  badge,
  className = "",
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <Card ref={cardRef} className={`transition-all duration-200 hover:shadow-md ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        
        {trend && (
          <div className="flex items-center mt-2">
            <span
              className={`text-xs font-medium ${
                trend.isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
              {trend.isPositive ? " ↑" : " ↓"}
            </span>
            {trend.label && (
              <span className="text-xs text-muted-foreground ml-1">
                {trend.label}
              </span>
            )}
          </div>
        )}

        {badge && (
          <Badge variant={badge.variant || "secondary"} className="mt-2">
            {badge.text}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
});

MetricsCard.displayName = "MetricsCard";
