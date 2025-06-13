
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
  Menu,
  User,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthorization } from "@/hooks/useAuthorization";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </Link>
  );
};

export const MobileSidebar: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();
  const currentPath = location.pathname;
  const { signOut, profile } = useAuth();
  const { isAdmin, isDeveloper, hasPermanentAdminRights, isMaster } = useAuthorization();
  
  const canAccessAdmin = isAdmin() || isDeveloper() || hasPermanentAdminRights() || isMaster();

  const handleLogout = async () => {
    await signOut();
    setIsOpen(false);
  };

  const closeSheet = () => setIsOpen(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu size={20} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="h-full bg-sidebar flex flex-col py-6 px-3">
              {/* Profile Section */}
              <div className="px-4 mb-8 flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {profile?.full_name ? getInitials(profile.full_name) : <User size={18} />}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-white truncate">
                    {profile?.full_name || 'Usuário'}
                  </p>
                  <p className="text-xs text-gray-300 capitalize">
                    {profile?.role || 'user'}
                  </p>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-1 flex-1">
                <NavItem
                  to="/dashboard"
                  icon={<Home size={20} />}
                  label="Dashboard"
                  active={currentPath === "/dashboard"}
                  onClick={closeSheet}
                />
                <NavItem
                  to="/products"
                  icon={<Package size={20} />}
                  label="Produtos"
                  active={currentPath.startsWith("/products")}
                  onClick={closeSheet}
                />
                <NavItem
                  to="/inventory"
                  icon={<Box size={20} />}
                  label="Estoque"
                  active={currentPath.startsWith("/inventory")}
                  onClick={closeSheet}
                />
                <NavItem
                  to="/suppliers"
                  icon={<Truck size={20} />}
                  label="Fornecedores"
                  active={currentPath.startsWith("/suppliers")}
                  onClick={closeSheet}
                />
                <NavItem
                  to="/reports"
                  icon={<BarChart size={20} />}
                  label="Relatórios"
                  active={currentPath.startsWith("/reports")}
                  onClick={closeSheet}
                />
                {canAccessAdmin && (
                  <NavItem
                    to="/admin"
                    icon={<ShieldCheck size={20} />}
                    label="Administração"
                    active={currentPath.startsWith("/admin")}
                    onClick={closeSheet}
                  />
                )}
                {isDeveloper() && (
                  <NavItem
                    to="/developer"
                    icon={<Code size={20} />}
                    label="Desenvolvedor"
                    active={currentPath.startsWith("/developer")}
                    onClick={closeSheet}
                  />
                )}
                <NavItem
                  to="/settings"
                  icon={<Settings size={20} />}
                  label="Configurações"
                  active={currentPath === "/settings"}
                  onClick={closeSheet}
                />
              </nav>

              {/* Logout */}
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
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};
