
import React from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  trend,
  className = "",
}) => {
  return (
    <div className={`data-card ${className}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <p className="text-xs md:text-sm text-muted-foreground font-medium truncate">{title}</p>
          <h3 className="text-lg md:text-2xl font-bold mt-1 truncate" title={value.toString()}>
            {value}
          </h3>
          
          {trend && trend.value > 0 && (
            <div className="flex items-center mt-1 md:mt-2">
              <span
                className={`text-xs font-medium ${
                  trend.isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {trend.isPositive ? "+" : "-"}{trend.value}%
                {trend.isPositive ? " ↑" : " ↓"}
              </span>
              <span className="text-xs text-muted-foreground ml-1 hidden md:inline">
                desde o mês passado
              </span>
            </div>
          )}
        </div>
        
        <div className="p-2 md:p-3 rounded-full bg-primary/10 text-primary ml-2 flex-shrink-0">
          {icon}
        </div>
      </div>
    </div>
  );
};
