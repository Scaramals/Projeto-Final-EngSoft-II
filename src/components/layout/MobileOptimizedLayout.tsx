
import React from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface MobileOptimizedLayoutProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const MobileOptimizedLayout: React.FC<MobileOptimizedLayoutProps> = ({
  children,
  className,
  title,
  subtitle,
  actions
}) => {
  const isMobile = useIsMobile();

  return (
    <div className={cn(
      "min-h-screen w-full",
      "bg-background text-foreground",
      "flex flex-col",
      // Mobile-first padding
      "p-3 sm:p-4 md:p-6 lg:p-8",
      className
    )}>
      {(title || actions) && (
        <div className={cn(
          "flex flex-col gap-3 mb-4",
          "sm:flex-row sm:justify-between sm:items-start sm:gap-4 sm:mb-6"
        )}>
          {title && (
            <div className="flex-1 min-w-0">
              <h1 className={cn(
                "font-bold text-foreground truncate",
                "text-xl sm:text-2xl lg:text-3xl"
              )}>
                {title}
              </h1>
              {subtitle && (
                <p className={cn(
                  "text-muted-foreground mt-1",
                  "text-sm sm:text-base"
                )}>
                  {subtitle}
                </p>
              )}
            </div>
          )}
          {actions && (
            <div className={cn(
              "flex flex-col gap-2",
              "sm:flex-row sm:gap-2 sm:shrink-0"
            )}>
              {actions}
            </div>
          )}
        </div>
      )}
      
      <div className="flex-1 w-full max-w-full">
        {children}
      </div>
    </div>
  );
};

// Container para conteúdo com espaçamento responsivo
export const MobileContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div className={cn(
      "w-full max-w-7xl mx-auto",
      "px-0 sm:px-2 md:px-4",
      className
    )}>
      {children}
    </div>
  );
};

// Card otimizado para mobile
export const MobileCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
}> = ({ children, className, padding = "md" }) => {
  const paddingClasses = {
    sm: "p-3 sm:p-4",
    md: "p-4 sm:p-6",
    lg: "p-6 sm:p-8"
  };

  return (
    <div className={cn(
      "bg-card text-card-foreground",
      "rounded-lg border shadow-sm",
      paddingClasses[padding],
      "w-full",
      "transition-all duration-200",
      "hover:shadow-md",
      className
    )}>
      {children}
    </div>
  );
};

// Grid responsivo otimizado para mobile
export const MobileGrid: React.FC<{
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
      "grid gap-3 sm:gap-4 md:gap-6",
      gridCols[columns],
      className
    )}>
      {children}
    </div>
  );
};
