
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Box,
  BarChart,
  Settings,
  Package,
  Home,
  LogOut,
  ShieldCheck,
  Code,
  Truck
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthorization } from "@/hooks/useAuthorization";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, active }) => {
  return (
    <Link
      to={to}
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

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { signOut, profile, user } = useAuth();
  const { isAdmin, isDeveloper, hasPermanentAdminRights, isMaster } = useAuthorization();
  
  const canAccessAdmin = isAdmin() || isDeveloper() || hasPermanentAdminRights() || isMaster();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="w-64 bg-sidebar h-full flex flex-col py-6 px-3 border-r border-border hidden md:flex">
      <div className="px-4 mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center">
          <Box className="mr-2" />
          StockControl
        </h1>
      </div>

      <nav className="space-y-1 flex-1">
        <NavItem
          to="/dashboard"
          icon={<Home size={20} />}
          label="Dashboard"
          active={currentPath === "/dashboard"}
        />
        <NavItem
          to="/products"
          icon={<Package size={20} />}
          label="Produtos"
          active={currentPath.startsWith("/products")}
        />
        <NavItem
          to="/inventory"
          icon={<Box size={20} />}
          label="Estoque"
          active={currentPath.startsWith("/inventory")}
        />
        <NavItem
          to="/suppliers"
          icon={<Truck size={20} />}
          label="Fornecedores"
          active={currentPath.startsWith("/suppliers")}
        />
        <NavItem
          to="/reports"
          icon={<BarChart size={20} />}
          label="Relatórios"
          active={currentPath.startsWith("/reports")}
        />
        {canAccessAdmin && (
          <NavItem
            to="/admin"
            icon={<ShieldCheck size={20} />}
            label="Administração"
            active={currentPath.startsWith("/admin")}
          />
        )}
        {isDeveloper() && (
          <NavItem
            to="/developer"
            icon={<Code size={20} />}
            label="Desenvolvedor"
            active={currentPath.startsWith("/developer")}
          />
        )}
        <NavItem
          to="/settings"
          icon={<Settings size={20} />}
          label="Configurações"
          active={currentPath === "/settings"}
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
  );
};
