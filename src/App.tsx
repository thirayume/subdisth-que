
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import QueueBoard from "./pages/QueueBoard";
import NotFound from "./pages/NotFound";
import Patients from "./pages/Patients";
import Medications from "./pages/Medications";
import Appointments from "./pages/Appointments";
import QueueHistory from "./pages/QueueHistory";
import Settings from "./pages/Settings";
import QueueTicket from "./pages/QueueTicket";
import PatientPortal from "./pages/PatientPortal";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/queue-board" element={<QueueBoard />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/medications" element={<Medications />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/history" element={<QueueHistory />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/queue-ticket/:id" element={<QueueTicket />} />
          <Route path="/patient-portal" element={<PatientPortal />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
