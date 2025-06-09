
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { Toaster as ToasterComponents } from "@/components/ui/toaster";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "@/pages/Index";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import DashboardPage from "@/pages/DashboardPage";
import ProductsPage from "@/pages/ProductsPage";
import AddProductPage from "@/pages/AddProductPage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import InventoryPage from "@/pages/InventoryPage";
import ReportsPage from "@/pages/ReportsPage";
import SuppliersPage from "@/pages/SuppliersPage";
import AddSupplierPage from "@/pages/AddSupplierPage";
import SupplierDetailPage from "@/pages/SupplierDetailPage";
import AdminPage from "@/pages/AdminPage";
import SettingsPage from "@/pages/SettingsPage";
import NotFound from "@/pages/NotFound";
import ErrorPage from "@/pages/ErrorPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } />
              
              <Route path="/products" element={
                <ProtectedRoute>
                  <ProductsPage />
                </ProtectedRoute>
              } />
              
              {/* Product routes - specific routes first */}
              <Route path="/products/add" element={
                <ProtectedRoute>
                  <AddProductPage />
                </ProtectedRoute>
              } />
              
              <Route path="/products/new" element={
                <ProtectedRoute>
                  <AddProductPage />
                </ProtectedRoute>
              } />
              
              <Route path="/products/:productId" element={
                <ProtectedRoute>
                  <ProductDetailPage />
                </ProtectedRoute>
              } />
              
              <Route path="/inventory" element={
                <ProtectedRoute>
                  <InventoryPage />
                </ProtectedRoute>
              } />
              
              <Route path="/reports" element={
                <ProtectedRoute>
                  <ReportsPage />
                </ProtectedRoute>
              } />
              
              <Route path="/suppliers" element={
                <ProtectedRoute>
                  <SuppliersPage />
                </ProtectedRoute>
              } />
              
              {/* Supplier routes - specific routes first */}
              <Route path="/suppliers/add" element={
                <ProtectedRoute>
                  <AddSupplierPage />
                </ProtectedRoute>
              } />
              
              <Route path="/suppliers/new" element={
                <ProtectedRoute>
                  <AddSupplierPage />
                </ProtectedRoute>
              } />
              
              <Route path="/suppliers/:supplierId" element={
                <ProtectedRoute>
                  <SupplierDetailPage />
                </ProtectedRoute>
              } />
              
              <Route path="/suppliers/:supplierId/edit" element={
                <ProtectedRoute>
                  <SupplierDetailPage />
                </ProtectedRoute>
              } />
              
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              } />
              
              <Route path="/settings" element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              } />
              
              {/* Error pages */}
              <Route path="/error/:errorCode" element={<ErrorPage />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Toaster />
          <ToasterComponents />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
