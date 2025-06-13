
import React from "react";
import { Outlet } from "react-router-dom";
import { MinimalSidebar } from "./MinimalSidebar";
import { MobileSidebar } from "./MobileSidebar";
import { useIsMobile } from "@/hooks/use-mobile";

export const AppLayout: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex w-full bg-background">
      {isMobile ? (
        <>
          <MobileSidebar />
          <main className="flex-1 min-w-0 overflow-auto">
            <div className="p-4 pt-16">
              <Outlet />
            </div>
          </main>
        </>
      ) : (
        <>
          <div className="flex-shrink-0">
            <MinimalSidebar />
          </div>
          <main className="flex-1 min-w-0 overflow-auto">
            <div className="p-2 md:p-4 lg:p-6">
              <Outlet />
            </div>
          </main>
        </>
      )}
    </div>
  );
};
