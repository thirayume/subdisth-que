
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Patients from './pages/Patients';
import NotFound from './pages/NotFound';
import Medications from './pages/Medications';
import QueueManagement from './pages/QueueManagement';
import QueueBoard from './pages/QueueBoard';
import QueueTicket from './pages/QueueTicket';
import Appointments from './pages/Appointments';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import PatientPortal from './pages/PatientPortal';
import QueueHistory from './pages/QueueHistory';
import LineCallback from './components/LineCallback';
import EmailConsentScreen from './components/EmailConsentScreen';
import PharmacyQueue from './pages/PharmacyQueue';
import { ThemeProvider } from "./components/theme/ThemeProvider";
import { Toaster } from 'sonner';
import './App.css';

function App() {
  return (
    <React.StrictMode>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/medications" element={<Medications />} />
            <Route path="/queue/management" element={<QueueManagement />} />
            <Route path="/queue/board" element={<QueueBoard />} />
            <Route path="/queue/ticket/:queueId" element={<QueueTicket />} />
            <Route path="/queue/history" element={<QueueHistory />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/patient-portal" element={<PatientPortal />} />
            <Route path="/line-callback" element={<LineCallback />} />
            <Route path="/email-consent" element={<EmailConsentScreen />} />
            <Route path="/pharmacy" element={<PharmacyQueue />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster richColors position="bottom-right" />
        </BrowserRouter>
      </ThemeProvider>
    </React.StrictMode>
  );
}

export default App;
