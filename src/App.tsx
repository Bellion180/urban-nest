import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import BuildingResidents from "./components/BuildingResidents";
import ResidentDetail from "./components/ResidentDetail";
<<<<<<< HEAD
=======
import ResidentFinancial from "./pages/ResidentFinancial";
import ResidentPersonal from "./pages/ResidentPersonal";
import ResidentInvi from "./pages/ResidentInvi";
>>>>>>> ef6d263 (Seleccion de datos)
import AdminPanel from "./components/AdminPanel";
import NotFound from "./pages/NotFound";

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
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/building/:buildingId" element={<BuildingResidents />} />
            <Route path="/resident/:residentId" element={<ResidentDetail />} />
<<<<<<< HEAD
=======
            <Route path="/resident/:id/financial" element={<ResidentFinancial />} />
            <Route path="/resident/:id/personal" element={<ResidentPersonal />} />
            <Route path="/resident/:id/invi" element={<ResidentInvi />} />
>>>>>>> ef6d263 (Seleccion de datos)
            <Route path="/admin" element={<AdminPanel />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
