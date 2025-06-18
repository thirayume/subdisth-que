
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ServicePointProvider } from '@/contexts/ServicePointContext';
import { AuthProvider } from '@/components/auth/AuthProvider';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import Patients from '@/pages/Patients';
import Medications from '@/pages/Medications';
import QueueManagement from '@/pages/QueueManagement';
import QueueBoard from '@/pages/QueueBoard';
import Settings from '@/pages/Settings';
import Analytics from '@/pages/Analytics';
import Appointments from '@/pages/Appointments';
import CreateQueue from '@/pages/CreateQueue';
import QueueTicket from '@/pages/QueueTicket';
import PharmacyQueue from '@/pages/PharmacyQueue';
import ServicePointQueue from '@/pages/ServicePointQueue';
import QueueHistory from '@/pages/QueueHistory';
import TestDashboard from '@/pages/TestDashboard';
import PatientPortal from '@/pages/PatientPortal';
import NotFound from '@/pages/NotFound';
import Auth from '@/pages/Auth';
import UserManagement from '@/pages/UserManagement';
import Layout from '@/components/layout/Layout';
import ConnectPhone from '@/pages/ConnectPhone';
import LineCallback from '@/components/LineCallback';
import PatientPortalAuthWrapper from '@/components/patient-portal/PatientPortalAuthWrapper';
import PatientAppointments from '@/components/patient-portal/PatientAppointments';
import PatientProfile from '@/components/patient-portal/PatientProfile';
import PatientMedications from '@/components/patient-portal/PatientMedications';

// Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ServicePointProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Routes>
                {/* Public routes */}
                <Route path="/auth" element={<Auth />} />
                <Route path="/patient-portal" element={<PatientPortal />} />
                <Route path="/patient-portal/connect-phone" element={<ConnectPhone />} />
                <Route path="/auth/line/callback" element={<LineCallback />} />
                <Route path="/queue/create" element={<CreateQueue />} />
                <Route path="/queue-ticket" element={<QueueTicket />} />
                <Route path="/queue-board" element={<QueueBoard />} />
                
                {/* Protected routes - require authentication */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Layout fullWidth={true}><Index /></Layout>
                  </ProtectedRoute>
                } />
                
                {/* Staff-level protected routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute requiredRole="staff">
                    <Layout><Dashboard /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/patients" element={
                  <ProtectedRoute requiredRole="staff">
                    <Layout fullWidth={true}><Patients /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/queue" element={
                  <ProtectedRoute requiredRole="staff">
                    <Layout fullWidth={true}><QueueManagement /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/appointments" element={
                  <ProtectedRoute requiredRole="staff">
                    <Layout fullWidth={true}><Appointments /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/pharmacy" element={
                  <ProtectedRoute requiredRole="staff">
                    <Layout fullWidth={true}><PharmacyQueue /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/service-point-queue" element={
                  <ProtectedRoute requiredRole="staff">
                    <Layout><ServicePointQueue /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/queue-history" element={
                  <ProtectedRoute requiredRole="staff">
                    <Layout fullWidth={true}><QueueHistory /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/analytics" element={
                  <ProtectedRoute requiredRole="staff">
                    <Layout fullWidth={true}><Analytics /></Layout>
                  </ProtectedRoute>
                } />
                
                {/* Admin-only routes */}
                <Route path="/medications" element={
                  <ProtectedRoute requiredRole="admin">
                    <Layout fullWidth={true}><Medications /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/user-management" element={
                  <ProtectedRoute requiredRole="admin">
                    <Layout fullWidth={true}><UserManagement /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute requiredRole="admin">
                    <Layout fullWidth={true}><Settings /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/test-dashboard" element={
                  <ProtectedRoute requiredRole="admin">
                    <TestDashboard />
                  </ProtectedRoute>
                } />
                
                {/* Patient portal protected routes */}
                <Route path="/patient-portal/appointments" element={
                  <PatientPortalAuthWrapper>
                    {(patients, selectedPatient) => {
                      const appointmentPatientContext = sessionStorage.getItem('appointmentPatientContext');
                      const contextPatient = appointmentPatientContext 
                        ? JSON.parse(appointmentPatientContext) 
                        : selectedPatient;
                      
                      if (!contextPatient) {
                        window.location.href = '/patient-portal';
                        return null;
                      }
                      
                      return <PatientAppointments patient={contextPatient} />;
                    }}
                  </PatientPortalAuthWrapper>
                } />
                <Route path="/patient-portal/medications" element={
                  <PatientPortalAuthWrapper>
                    {(patients, selectedPatient) => {
                      const medicationPatientContext = sessionStorage.getItem('medicationPatientContext');
                      const contextPatient = medicationPatientContext 
                        ? JSON.parse(medicationPatientContext) 
                        : selectedPatient;
                      
                      if (!contextPatient) {
                        window.location.href = '/patient-portal';
                        return null;
                      }
                      
                      return <PatientMedications patient={contextPatient} />;
                    }}
                  </PatientPortalAuthWrapper>
                } />
                <Route path="/patient-portal/profile" element={
                  <PatientPortalAuthWrapper>
                    {(patients, selectedPatient) => {
                      const profilePatientContext = sessionStorage.getItem('profilePatientContext');
                      const contextPatient = profilePatientContext 
                        ? JSON.parse(profilePatientContext) 
                        : selectedPatient;
                      
                      if (!contextPatient) {
                        window.location.href = '/patient-portal';
                        return null;
                      }
                      
                      return <PatientProfile patient={contextPatient} />;
                    }}
                  </PatientPortalAuthWrapper>
                } />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </Router>
        </ServicePointProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
