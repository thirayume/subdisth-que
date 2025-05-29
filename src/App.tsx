
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ServicePointProvider } from '@/contexts/ServicePointContext';
import { lazy, Suspense } from "react";

// Critical pages - load immediately
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";

// Lazy load other pages for better performance
const Patients = lazy(() => import("@/pages/Patients"));
const QueueManagement = lazy(() => import("@/pages/QueueManagement"));
const PharmacyQueue = lazy(() => import("@/pages/PharmacyQueue"));
const QueueBoard = lazy(() => import("@/pages/QueueBoard"));
const QueueHistory = lazy(() => import("@/pages/QueueHistory"));
const QueueTicket = lazy(() => import("@/pages/QueueTicket"));
const Appointments = lazy(() => import("@/pages/Appointments"));
const PatientPortal = lazy(() => import("@/pages/PatientPortal"));
const Settings = lazy(() => import("@/pages/Settings"));
const LineCallback = lazy(() => import("@/components/LineCallback"));
const Medications = lazy(() => import("@/pages/Medications"));
const Analytics = lazy(() => import("@/pages/Analytics"));
const CreateQueue = lazy(() => import("@/pages/CreateQueue"));
const TestDashboard = lazy(() => import("@/pages/TestDashboard"));

// Create a client with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
);

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <ServicePointProvider>
          <Router>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={<Index />} />
                <Route path="/patients" element={<Patients />} />
                
                {/* Queue Management - Enhanced routes */}
                <Route path="/queue" element={<Navigate to="/queue-management" />} />
                <Route path="/queue-management" element={<QueueManagement />} />
                
                {/* Queue Creation */}
                <Route path="/queue/create" element={<CreateQueue />} />
                <Route path="/create-queue" element={<Navigate to="/queue/create" />} />
                
                {/* Test Dashboard - Admin/Development only */}
                <Route path="/test-dashboard" element={<TestDashboard />} />
                
                {/* Pharmacy Queue */}
                <Route path="/pharmacy" element={<PharmacyQueue />} />
                
                {/* Queue Board */}
                <Route path="/queue-board" element={<QueueBoard />} />
                <Route path="/queue/board" element={<Navigate to="/queue-board" />} />
                
                {/* Queue History */}
                <Route path="/queue-history" element={<QueueHistory />} />
                <Route path="/queue/history" element={<Navigate to="/queue-history" />} />
                
                <Route path="/queue-ticket/:id" element={<QueueTicket />} />
                <Route path="/appointments" element={<Appointments />} />
                <Route path="/patient-portal" element={<PatientPortal />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/line-callback" element={<LineCallback />} />
                <Route path="/medications" element={<Medications />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <Toaster position="top-center" richColors />
          </Router>
        </ServicePointProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
