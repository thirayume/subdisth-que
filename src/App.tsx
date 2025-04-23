
import * as React from "react";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import OfflineIndicator from "@/components/ui/OfflineIndicator";
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
import QueueManagement from "./pages/QueueManagement";
import Analytics from "./pages/Analytics";

// DEBUG: Log the React version and object reference
console.log("[DEBUG] App.tsx React version:", React.version, React);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 3,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: true,
      refetchOnReconnect: "always"
    },
    mutations: {
      retry: 2
    }
  }
});

const App: React.FC = () => {
  React.useEffect(() => {
    console.log("[DEBUG] App component mounted");
    return () => {
      console.log("[DEBUG] App component unmounted");
    };
  }, []);

  // Check if React hooks are working
  const [testState, setTestState] = React.useState("Working");
  console.log("[DEBUG] React hooks test:", testState);

  return (
    <React.StrictMode>
      <ThemeProvider>
        <BrowserRouter>
          <QueryClientProvider client={queryClient}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/queue-management" element={<QueueManagement />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/queue-board" element={<QueueBoard />} />
              <Route path="/patients" element={<Patients />} />
              <Route path="/medications" element={<Medications />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/history" element={<QueueHistory />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/queue-ticket/:id" element={<QueueTicket />} />
              <Route path="/patient-portal" element={<PatientPortal />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
            <OfflineIndicator />
          </QueryClientProvider>
        </BrowserRouter>
      </ThemeProvider>
    </React.StrictMode>
  );
};

export default App;
