import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ServicePointProvider } from '@/contexts/ServicePointContext';

// Pages
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import Patients from "@/pages/Patients";
import QueueManagement from "@/pages/QueueManagement";
import PharmacyQueue from "@/pages/PharmacyQueue";
import QueueBoard from "@/pages/QueueBoard";
import QueueHistory from "@/pages/QueueHistory";
import QueueTicket from "@/pages/QueueTicket";
import Appointments from "@/pages/Appointments";
import PatientPortal from "@/pages/PatientPortal";
import Settings from "@/pages/Settings";
import LineCallback from "@/components/LineCallback";
import Medications from "@/pages/Medications";
import Analytics from "@/pages/Analytics";
import CreateQueue from "@/pages/CreateQueue"; // Add import for the new page
import TestDashboard from "@/pages/TestDashboard"; // Add import for the new page

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <ServicePointProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<Index />} />
              <Route path="/patients" element={<Patients />} />
              
              {/* Queue Management Routes - Updated to support both formats */}
              <Route path="/queue" element={<QueueManagement />} />
              <Route path="/queue/management" element={<QueueManagement />} />
              <Route path="/queue/management/" element={<QueueManagement />} />
              
              {/* Queue Creation Routes */}
              <Route path="/queue/create" element={<CreateQueue />} />
              <Route path="/create-queue" element={<CreateQueue />} />
              
              {/* Test Dashboard */}
              <Route path="/test-dashboard" element={<TestDashboard />} />
              <Route path="/test" element={<TestDashboard />} />
              
              {/* Pharmacy Queue */}
              <Route path="/pharmacy" element={<PharmacyQueue />} />
              
              {/* Queue Board Routes */}
              <Route path="/queue-board" element={<QueueBoard />} />
              <Route path="/queue/board" element={<QueueBoard />} />
              <Route path="/queue/board/" element={<QueueBoard />} />
              
              {/* Queue History Routes */}
              <Route path="/queue-history" element={<QueueHistory />} />
              <Route path="/queue/history" element={<QueueHistory />} />
              <Route path="/queue/history/" element={<QueueHistory />} />
              
              <Route path="/queue-ticket/:id" element={<QueueTicket />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/patient-portal" element={<PatientPortal />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/line-callback" element={<LineCallback />} />
              <Route path="/medications" element={<Medications />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster position="top-center" richColors />
          </Router>
        </ServicePointProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
