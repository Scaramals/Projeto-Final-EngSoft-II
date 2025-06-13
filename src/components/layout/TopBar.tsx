
import React, { useState } from "react";
import { Menu, Search, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MobileSidebar } from "./MobileSidebar";
import { NotificationsPopover } from "@/components/notifications/NotificationsPopover";
import { useNavigate } from "react-router-dom";

export const TopBar: React.FC = () => {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <>
      <header className="bg-white border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setShowMobileSidebar(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          
          {/* Logo Vdev.0 */}
          <div className="hidden md:flex items-center ml-2">
            <div className="bg-primary/10 rounded-full p-2 mr-3">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-foreground">StockControl</span>
              <span className="text-xs text-muted-foreground">by Vdev.0</span>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-md px-4 hidden md:flex">
          <form onSubmit={handleSearch} className="relative w-full">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar produtos, categorias, fornecedores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-4 py-2 w-full rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </form>
        </div>

        <div className="flex items-center space-x-4">
          <NotificationsPopover />
          <div className="flex items-center">
            <span className="text-sm font-medium mr-2 hidden md:inline">
              Admin
            </span>
            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
              <Package className="h-4 w-4" />
            </div>
          </div>
        </div>
      </header>

      <MobileSidebar 
        isOpen={showMobileSidebar} 
        onClose={() => setShowMobileSidebar(false)} 
      />
    </>
  );
};
