
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
  Truck,
  User,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthorization } from "@/hooks/useAuthorization";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface NavIconProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}

const NavIcon: React.FC<NavIconProps> = ({ to, icon, label, active }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          to={to}
          className={`flex items-center justify-center w-12 h-12 rounded-lg transition-colors ${
            active
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          }`}
        >
          {icon}
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right">
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export const MinimalSidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const location = useLocation();
  const currentPath = location.pathname;
  const { signOut, profile, user } = useAuth();
  const { isAdmin, isDeveloper, hasPermanentAdminRights, isMaster } = useAuthorization();
  
  const canAccessAdmin = isAdmin() || isDeveloper() || hasPermanentAdminRights() || isMaster();

  const handleLogout = async () => {
    await signOut();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <TooltipProvider>
      <div className={`h-full bg-sidebar border-r border-border flex flex-col items-center py-4 px-2 relative transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-16'}`}>
        {/* Profile Avatar */}
        <div className="mb-6">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center cursor-pointer">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {profile?.full_name ? getInitials(profile.full_name) : <User size={18} />}
                  </AvatarFallback>
                </Avatar>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{profile?.full_name || 'Usuário'}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Navigation Icons */}
        <nav className="flex flex-col space-y-2 flex-1">
          <NavIcon
            to="/dashboard"
            icon={<Home size={20} />}
            label="Dashboard"
            active={currentPath === "/dashboard"}
          />
          <NavIcon
            to="/products"
            icon={<Package size={20} />}
            label="Produtos"
            active={currentPath.startsWith("/products")}
          />
          <NavIcon
            to="/inventory"
            icon={<Box size={20} />}
            label="Estoque"
            active={currentPath.startsWith("/inventory")}
          />
          <NavIcon
            to="/suppliers"
            icon={<Truck size={20} />}
            label="Fornecedores"
            active={currentPath.startsWith("/suppliers")}
          />
          <NavIcon
            to="/reports"
            icon={<BarChart size={20} />}
            label="Relatórios"
            active={currentPath.startsWith("/reports")}
          />
          {canAccessAdmin && (
            <NavIcon
              to="/admin"
              icon={<ShieldCheck size={20} />}
              label="Administração"
              active={currentPath.startsWith("/admin")}
            />
          )}
          {isDeveloper() && (
            <NavIcon
              to="/developer"
              icon={<Code size={20} />}
              label="Desenvolvedor"
              active={currentPath.startsWith("/developer")}
            />
          )}
          <NavIcon
            to="/settings"
            icon={<Settings size={20} />}
            label="Configurações"
            active={currentPath === "/settings"}
          />
        </nav>

        {/* Collapse Button - Centro da sidebar */}
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="w-6 h-6 rounded-full bg-background border shadow-sm hover:bg-accent"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{isCollapsed ? 'Expandir' : 'Recolher'}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Logout Button */}
        <div className="mt-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                className="flex items-center justify-center w-12 h-12 rounded-lg text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
                onClick={handleLogout}
              >
                <LogOut size={20} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Sair</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};
