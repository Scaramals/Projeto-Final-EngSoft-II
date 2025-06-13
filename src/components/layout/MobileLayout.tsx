
import React from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { AppLayout } from "./AppLayout";

interface MobileLayoutProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  showSearch?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  className,
  title,
  subtitle,
  actions,
  showSearch = false,
  searchPlaceholder = "Pesquisar...",
  searchValue = "",
  onSearchChange
}) => {
  const isMobile = useIsMobile();

  return (
    <AppLayout>
      <div className={cn(
        "flex-1 w-full",
        "bg-background",
        // Mobile: padding reduzido e otimizado
        "p-3 pb-safe-area-inset-bottom",
        // Desktop: padding normal
        "sm:p-6",
        className
      )}>
        {/* Header Section */}
        <div className={cn(
          "flex flex-col gap-3 mb-4",
          "sm:gap-4 sm:mb-6"
        )}>
          {/* Title and Actions */}
          {(title || actions) && (
            <div className={cn(
              "flex flex-col gap-3",
              "sm:flex-row sm:justify-between sm:items-start sm:gap-4"
            )}>
              {title && (
                <div className="flex-1 min-w-0">
                  <h1 className={cn(
                    "font-bold text-foreground",
                    "text-xl leading-tight",
                    "sm:text-2xl sm:leading-normal",
                    "lg:text-3xl"
                  )}>
                    {title}
                  </h1>
                  {subtitle && (
                    <p className={cn(
                      "text-muted-foreground mt-1",
                      "text-sm leading-relaxed",
                      "sm:text-base"
                    )}>
                      {subtitle}
                    </p>
                  )}
                </div>
              )}
              
              {actions && (
                <div className={cn(
                  "flex flex-col gap-2 w-full",
                  "sm:flex-row sm:gap-2 sm:w-auto sm:shrink-0"
                )}>
                  {actions}
                </div>
              )}
            </div>
          )}

          {/* Search Bar - Mobile optimized */}
          {showSearch && (
            <div className="relative">
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className={cn(
                  "w-full rounded-lg border border-input",
                  "bg-background px-4 py-3",
                  "text-base placeholder:text-muted-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  "sm:py-2 sm:text-sm"
                )}
              />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 w-full">
          {children}
        </div>
      </div>
    </AppLayout>
  );
};

// Card otimizado especificamente para mobile
export const MobileCardLayout: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}> = ({ children, className, onClick }) => {
  return (
    <div 
      className={cn(
        "bg-card text-card-foreground",
        "rounded-lg border shadow-sm",
        "p-4 space-y-3",
        "active:bg-accent/50 transition-colors",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// Grid responsivo específico para mobile
export const MobileGrid: React.FC<{
  children: React.ReactNode;
  columns?: 1 | 2;
  className?: string;
}> = ({ children, columns = 1, className }) => {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2"
  };

  return (
    <div className={cn(
      "grid gap-3",
      "sm:gap-4",
      gridCols[columns],
      className
    )}>
      {children}
    </div>
  );
};
