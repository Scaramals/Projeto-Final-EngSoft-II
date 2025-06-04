
import React, { useState } from "react";
import { Bell, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MobileSidebar } from "./MobileSidebar";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export const TopBar: React.FC = () => {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleNotificationClick = () => {
    toast({
      title: "Notificações",
      description: "Você tem 3 alertas de estoque baixo",
    });
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
        </div>

        <div className="flex-1 max-w-md px-4 hidden md:flex">
          <form onSubmit={handleSearch} className="relative w-full">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Pesquisar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-4 py-2 w-full rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </form>
        </div>

        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            onClick={handleNotificationClick}
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
          </Button>
          <div className="flex items-center">
            <span className="text-sm font-medium mr-2 hidden md:inline">
              Admin
            </span>
            <div className="h-8 w-8 rounded-full bg-inventory-purple text-white flex items-center justify-center">
              A
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
