
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
          <main className="flex-1 p-4">
            <Outlet />
          </main>
        </>
      ) : (
        <>
          <div className="w-16 flex-shrink-0">
            <MinimalSidebar />
          </div>
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </>
      )}
    </div>
  );
};
