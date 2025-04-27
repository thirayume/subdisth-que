
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
import "./App.css";

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
    
    // Add a visible debug element when in development
    if (process.env.NODE_ENV === 'development') {
      const debugElement = document.createElement('div');
      debugElement.style.position = 'fixed';
      debugElement.style.bottom = '0';
      debugElement.style.right = '0';
      debugElement.style.backgroundColor = 'rgba(0,0,0,0.7)';
      debugElement.style.color = '#fff';
      debugElement.style.padding = '4px 8px';
      debugElement.style.fontSize = '10px';
      debugElement.style.zIndex = '9999';
      debugElement.textContent = 'Debug: App mounted';
      document.body.appendChild(debugElement);
    }
    
    return () => {
      console.log("[DEBUG] App component unmounted");
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <div className="min-h-screen bg-background text-foreground">
          <BrowserRouter>
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
          </BrowserRouter>
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
