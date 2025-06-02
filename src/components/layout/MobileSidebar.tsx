
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Box,
  BarChart,
  Settings,
  Package,
  Home,
  LogOut,
  Users,
  ShieldCheck,
  Code,
  Truck,
  X
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthorization } from "@/hooks/useAuthorization";
import { Button } from "@/components/ui/button";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, active, onClick }) => {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
        active
          ? "bg-inventory-blue text-white"
          : "text-gray-300 hover:bg-sidebar-accent hover:text-white"
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </Link>
  );
};

export const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { signOut, profile, user } = useAuth();
  const { isAdmin, isDeveloper, hasPermanentAdminRights, isMaster } = useAuthorization();
  
  const canAccessAdmin = isAdmin() || isDeveloper() || hasPermanentAdminRights() || isMaster();

  const handleLogout = async () => {
    await signOut();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed left-0 top-0 w-64 bg-sidebar h-full flex flex-col py-6 px-3 border-r border-border z-50 md:hidden transform transition-transform duration-300 ease-in-out">
        {/* Header com botão de fechar */}
        <div className="flex items-center justify-between px-4 mb-8">
          <h1 className="text-2xl font-bold text-white flex items-center">
            <Box className="mr-2" />
            StockControl
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-sidebar-accent"
          >
            <X size={20} />
          </Button>
        </div>

        <nav className="space-y-1 flex-1">
          <NavItem
            to="/dashboard"
            icon={<Home size={20} />}
            label="Dashboard"
            active={currentPath === "/dashboard"}
            onClick={onClose}
          />
          <NavItem
            to="/products"
            icon={<Package size={20} />}
            label="Produtos"
            active={currentPath.startsWith("/products")}
            onClick={onClose}
          />
          <NavItem
            to="/inventory"
            icon={<Box size={20} />}
            label="Estoque"
            active={currentPath.startsWith("/inventory")}
            onClick={onClose}
          />
          <NavItem
            to="/suppliers"
            icon={<Truck size={20} />}
            label="Fornecedores"
            active={currentPath.startsWith("/suppliers")}
            onClick={onClose}
          />
          <NavItem
            to="/reports"
            icon={<BarChart size={20} />}
            label="Relatórios"
            active={currentPath.startsWith("/reports")}
            onClick={onClose}
          />
          {canAccessAdmin && (
            <>
              <NavItem
                to="/users"
                icon={<Users size={20} />}
                label="Usuários"
                active={currentPath.startsWith("/users")}
                onClick={onClose}
              />
              <NavItem
                to="/admin"
                icon={<ShieldCheck size={20} />}
                label="Administração"
                active={currentPath.startsWith("/admin")}
                onClick={onClose}
              />
            </>
          )}
          {isDeveloper() && (
            <NavItem
              to="/developer"
              icon={<Code size={20} />}
              label="Desenvolvedor"
              active={currentPath.startsWith("/developer")}
              onClick={onClose}
            />
          )}
          <NavItem
            to="/settings"
            icon={<Settings size={20} />}
            label="Configurações"
            active={currentPath === "/settings"}
            onClick={onClose}
          />
        </nav>

        <div className="px-4 mt-auto pt-4 border-t border-sidebar-border">
          <button 
            className="flex items-center space-x-3 text-gray-300 hover:text-white w-full px-4 py-3 rounded-lg transition-colors"
            onClick={handleLogout}
          >
            <LogOut size={20} />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </div>
    </>
  );
};
