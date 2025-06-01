import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from '@/pages/Index';
import DashboardContent from '@/pages/Dashboard';
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
import Layout from '@/components/layout/Layout';
import ConnectPhone from '@/pages/ConnectPhone';
import LineCallback from '@/components/LineCallback';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Layout><DashboardContent /></Layout>} />
          <Route path="/patients" element={<Layout><Patients /></Layout>} />
          <Route path="/medications" element={<Layout><Medications /></Layout>} />
          <Route path="/queue-management" element={<Layout><QueueManagement /></Layout>} />
          <Route path="/queue-board" element={<QueueBoard />} />
          <Route path="/settings" element={<Layout><Settings /></Layout>} />
          <Route path="/analytics" element={<Layout><Analytics /></Layout>} />
          <Route path="/appointments" element={<Layout><Appointments /></Layout>} />
          <Route path="/create-queue" element={<CreateQueue />} />
          <Route path="/queue-ticket" element={<QueueTicket />} />
          <Route path="/pharmacy-queue" element={<Layout><PharmacyQueue /></Layout>} />
          <Route path="/service-point-queue" element={<Layout><ServicePointQueue /></Layout>} />
          <Route path="/queue-history" element={<Layout><QueueHistory /></Layout>} />
          <Route path="/test-dashboard" element={<Layout><TestDashboard /></Layout>} />
          <Route path="/patient-portal" element={<PatientPortal />} />
          <Route path="/patient-portal/connect-phone" element={<ConnectPhone />} />
          <Route path="/auth/line/callback" element={<LineCallback />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
