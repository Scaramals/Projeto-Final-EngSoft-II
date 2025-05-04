
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import AddProductPage from "./pages/AddProductPage";
import InventoryPage from "./pages/InventoryPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import AdminPage from "./pages/AdminPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          
          {/* Protected routes (would be guarded by auth in real app) */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/new" element={<AddProductPage />} />
          <Route path="/products/:productId" element={<ProductDetailPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/admin" element={<AdminPage />} />
          
          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
