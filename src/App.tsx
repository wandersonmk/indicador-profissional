import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";

// Public Pages
import HomePage from "./pages/HomePage";
import ProfessionalsPage from "./pages/ProfessionalsPage";
import ProfessionalDetailPage from "./pages/ProfessionalDetailPage";
import NotFound from "./pages/NotFound";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import RegisterSuccessPage from "./pages/auth/RegisterSuccessPage";
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Professional Dashboard Pages
import DashboardPage from "./pages/professional/DashboardPage";
import ProfilePage from "./pages/professional/ProfilePage";

// Admin Pages
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import PendingApprovalsPage from "./pages/admin/PendingApprovalsPage";
import PendingDetailPage from "./pages/admin/PendingDetailPage";
import AllProfessionalsPage from "./pages/admin/AllProfessionalsPage";
import FieldConfigPage from "./pages/admin/FieldConfigPage";
import ProfessionalDetailsPage from "./pages/admin/ProfessionalDetailsPage";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ 
  children, 
  allowedRoles = ["professional", "admin"], 
  redirectPath = "/login" 
}: { 
  children: React.ReactNode, 
  allowedRoles?: string[], 
  redirectPath?: string 
}) => {
  const { user, isLoading } = useAuth();

  // Still loading auth state
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Carregando...</div>;
  }

  // Not authenticated or not authorized
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={redirectPath} replace />;
  }

  // Authenticated and authorized
  return children;
};

// Admin-only route
const AdminRoute = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute allowedRoles={["admin"]} redirectPath="/">
    {children}
  </ProtectedRoute>
);

// Professional-only route
const ProfessionalRoute = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute allowedRoles={["professional"]} redirectPath="/">
    {children}
  </ProtectedRoute>
);

// Layout with header for public pages
const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col bg-gray-50">
    <Header />
    <main className="flex-1">{children}</main>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes with Header */}
            <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
            <Route path="/professionals" element={<PublicLayout><ProfessionalsPage /></PublicLayout>} />
            <Route path="/professionals/:id" element={<PublicLayout><ProfessionalDetailPage /></PublicLayout>} />
            <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
            <Route path="/register" element={<PublicLayout><RegisterPage /></PublicLayout>} />
            <Route path="/register-success" element={<PublicLayout><RegisterSuccessPage /></PublicLayout>} />
            <Route path="/forgot-password" element={<PublicLayout><ForgotPasswordPage /></PublicLayout>} />
            
            {/* Professional Routes (protected) */}
            <Route path="/dashboard" element={<ProfessionalRoute><DashboardPage /></ProfessionalRoute>} />
            <Route path="/profile" element={<ProfessionalRoute><ProfilePage /></ProfessionalRoute>} />
            
            {/* Admin Routes (protected) */}
            <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
            <Route path="/admin/pending" element={<AdminRoute><PendingApprovalsPage /></AdminRoute>} />
            <Route path="/admin/pending/:id" element={<AdminRoute><ProfessionalDetailsPage /></AdminRoute>} />
            <Route path="/admin/professionals" element={<AdminRoute><AllProfessionalsPage /></AdminRoute>} />
            <Route path="/admin/professionals/:id" element={<AdminRoute><ProfessionalDetailsPage /></AdminRoute>} />
            <Route path="/admin/field-config" element={<AdminRoute><FieldConfigPage /></AdminRoute>} />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
