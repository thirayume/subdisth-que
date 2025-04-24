
import React from 'react';
import Layout from '@/components/layout/Layout';
import { usePatients } from '@/hooks/usePatients';
import QueueSummaryCards from '@/components/dashboard/QueueSummaryCards';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardCards from '@/components/dashboard/DashboardCards';
import { useDashboardQueues } from '@/components/dashboard/useDashboardQueues';
import { useDashboardStats } from '@/components/dashboard/useDashboardStats';

// Add debug logging
console.log("[DEBUG] Dashboard component importing React:", React);

const Dashboard = () => {
  console.log('[Dashboard] Component rendering');
  
  try {
    // Get patients and queue data 
    const { patients = [] } = usePatients() || { patients: [] };
    const { waitingQueues = [], activeQueues = [], completedQueues = [] } = useDashboardQueues() || {};
    const todayStats = useDashboardStats(completedQueues || []);

    console.log('[Dashboard] Queue counts:', {
      waiting: waitingQueues?.length || 0,
      active: activeQueues?.length || 0,
      completed: completedQueues?.length || 0
    });

    return (
      <Layout>
        <DashboardHeader />
        
        <QueueSummaryCards 
          waitingQueues={waitingQueues || []}
          activeQueues={activeQueues || []}
          completedQueues={completedQueues || []}
          queues={[...(waitingQueues || []), ...(activeQueues || []), ...(completedQueues || [])]}
          avgWaitTime={todayStats?.avgWaitTime || 0}
          avgServiceTime={todayStats?.avgServiceTime || 0}
        />
        
        <DashboardCards 
          waitingQueues={waitingQueues || []}
          activeQueues={activeQueues || []}
          completedQueues={completedQueues || []}
          patientsCount={patients?.length || 0}
          avgWaitTime={todayStats?.avgWaitTime || 0}
        />
      </Layout>
    );
  } catch (error) {
    console.error('[Dashboard] Error rendering dashboard:', error);
    return (
      <Layout>
        <div className="p-6 text-center">
          <h2 className="text-2xl font-semibold text-red-600 mb-4">Failed to load dashboard</h2>
          <p className="text-gray-600">An error occurred while loading the dashboard. Please try refreshing the page.</p>
        </div>
      </Layout>
    );
  }
};

export default Dashboard;
