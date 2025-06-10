
import React from "react";
import { cn } from "@/lib/utils";

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn(
      "min-h-screen w-full",
      "bg-background text-foreground",
      "flex flex-col",
      "px-4 py-6",
      "sm:px-6 sm:py-8",
      "lg:px-8 lg:py-10",
      className
    )}>
      <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col space-y-6">
        {children}
      </div>
    </div>
  );
};

// Container para cards responsivos
export const ResponsiveGrid: React.FC<{
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}> = ({ children, columns = 2, className }) => {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
  };

  return (
    <div className={cn(
      "grid gap-4 sm:gap-6",
      gridCols[columns],
      className
    )}>
      {children}
    </div>
  );
};

// Card responsivo
export const ResponsiveCard: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div className={cn(
      "bg-card text-card-foreground",
      "rounded-lg border shadow-sm",
      "p-4 sm:p-6",
      "w-full",
      "transition-all duration-200",
      "hover:shadow-md",
      className
    )}>
      {children}
    </div>
  );
};
