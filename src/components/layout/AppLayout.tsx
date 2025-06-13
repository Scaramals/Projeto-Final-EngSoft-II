
import React from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { useIsMobile } from "@/hooks/use-mobile";

export const AppLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 w-full min-w-0">
        <TopBar />
        <main className={`
          flex-1 overflow-y-auto w-full
          ${isMobile ? 'pb-safe-area-inset-bottom' : ''}
        `}>
          <div className="w-full h-full min-h-0">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
};
