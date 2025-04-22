
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
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

// Configure the query client with offline support
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Keep data fresh for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Retry failed requests 3 times
      retry: 3,
      // Cache successful responses for 10 minutes (using gcTime instead of cacheTime)
      gcTime: 10 * 60 * 1000,
      // Use stale data while revalidating
      refetchOnWindowFocus: true,
      // Don't refetch on reconnect if the data is still fresh
      refetchOnReconnect: "always"
    },
    mutations: {
      // Retry failed mutations 2 times
      retry: 2
    }
  }
});

const App = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <TooltipProvider>
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
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
            <Sonner />
            <OfflineIndicator />
          </TooltipProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;
