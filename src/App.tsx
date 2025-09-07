import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SeleccionNivel } from '@/components/SeleccionNivel';
import Index from "./pages/Index";
import Login from "./components/Login";
import ForgotPassword from "./components/ForgotPassword";
import PasswordRecovery from "./components/PasswordRecovery";
import Dashboard from "./components/Dashboard";
import DashboardTest from "./components/DashboardTest";
import DashboardFixed from "./components/DashboardFixed";
import FloorResidents from "./components/FloorResidents";
import BuildingResidents from "./components/BuildingResidents";
import ResidentDetail from "./components/ResidentDetail";
import ResidentFinancialInfo from "./components/ResidentFinancialInfo";
import ResidentPersonalInfo from "./components/ResidentPersonalInfo";
import ResidentInviInfo from "./components/ResidentInviInfo";
import AdminPanel from "./components/AdminPanel";
import NotFound from "./pages/NotFound";
import AddAssociate from './components/AddAssociate';
import AddResident from './components/AddResident';
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/password-recovery" element={<PasswordRecovery />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard-test" element={<DashboardTest />} />
            <Route path="/dashboard-fixed" element={<DashboardFixed />} />
            <Route path="/building/:buildingId" element={<BuildingResidents />} />
            <Route path="/building/:buildingId/niveles" element={<SeleccionNivel />} />
            <Route path="/building/:buildingId/floor/:floorNumber/residents" element={<FloorResidents />} />
            <Route path="/resident/:residentId" element={<ResidentDetail />} />
            <Route path="/resident/:residentId/financial" element={<ResidentFinancialInfo />} />
            <Route path="/resident/:residentId/personal" element={<ResidentPersonalInfo />} />
            <Route path="/resident/:residentId/invi" element={<ResidentInviInfo />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/add-associate" element={<AddAssociate />} />
            <Route path="/add-resident" element={<AddResident />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
