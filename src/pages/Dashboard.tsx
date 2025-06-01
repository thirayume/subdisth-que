
import React from 'react';
import DashboardContent from '@/components/dashboard/DashboardContent';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { useQueues } from '@/hooks/useQueues';
import { usePatients } from '@/hooks/usePatients';

const Dashboard: React.FC = () => {
  const { 
    waitingQueues, 
    activeQueues, 
    completedQueues, 
    skippedQueues, 
    updateQueueStatus,
    callQueue,
    recallQueue
  } = useQueues();
  
  const { patients } = usePatients();

  return (
    <div className="space-y-6">
      <DashboardHeader />
      <DashboardContent
        waitingQueues={waitingQueues}
        activeQueues={activeQueues}
        completedQueues={completedQueues}
        skippedQueues={skippedQueues}
        patients={patients}
        onUpdateStatus={updateQueueStatus}
        onCallQueue={callQueue}
        onRecallQueue={recallQueue}
      />
    </div>
  );
};

export default Dashboard;
