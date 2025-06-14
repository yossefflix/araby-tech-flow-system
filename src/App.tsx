
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import AdminWorkOrders from "./pages/AdminWorkOrders";
import AdminWorkReports from "./pages/AdminWorkReports";
import TechnicianLogin from "./pages/TechnicianLogin";
import TechnicianDashboard from "./pages/TechnicianDashboard";
import WorkOrderForm from "./pages/WorkOrderForm";
import CallCenterDashboard from "./pages/CallCenterDashboard";
import CallCenterWorkOrder from "./pages/CallCenterWorkOrder";
import Register from "./pages/Register";
import CallCenterRegister from "./pages/CallCenterRegister";
import CallCenterLogin from "./pages/CallCenterLogin";
import AccountManagement from "./pages/AccountManagement";
import WorkReports from "./pages/WorkReports";
import CallCenterOrdersManagement from "./pages/CallCenterOrdersManagement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/register" element={<Register />} />
          <Route path="/call-center-register" element={<CallCenterRegister />} />
          <Route path="/call-center-login" element={<CallCenterLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/account-management" element={<AccountManagement />} />
          <Route path="/admin-work-orders" element={<AdminWorkOrders />} />
          <Route path="/admin-work-reports" element={<AdminWorkReports />} />
          <Route path="/call-center-work-order" element={<CallCenterWorkOrder />} />
          <Route path="/call-center-orders-management" element={<CallCenterOrdersManagement />} />
          <Route path="/technician-login" element={<TechnicianLogin />} />
          <Route path="/technician" element={<TechnicianDashboard />} />
          <Route path="/work-order/:id" element={<WorkOrderForm />} />
          <Route path="/call-center" element={<CallCenterDashboard />} />
          <Route path="/work-reports" element={<WorkReports />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
