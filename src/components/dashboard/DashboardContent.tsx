
import React from 'react';
import { Queue, QueueStatus, Patient } from '@/integrations/supabase/schema';
import QueueTabs from './QueueTabs';
import DashboardSidebar from './DashboardSidebar';

interface DashboardContentProps {
  waitingQueues: Queue[];
  activeQueues: Queue[];
  completedQueues: Queue[];
  skippedQueues: Queue[];
  patients: Patient[];
  onUpdateStatus: (queueId: string, status: QueueStatus) => void;
  onCallQueue: (queueId: string) => void;
  onRecallQueue: (queueId: string) => void;
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  waitingQueues,
  activeQueues,
  completedQueues,
  skippedQueues,
  patients,
  onUpdateStatus,
  onCallQueue,
  onRecallQueue
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3">
        <QueueTabs
          waitingQueues={waitingQueues}
          activeQueues={activeQueues}
          completedQueues={completedQueues}
          skippedQueues={skippedQueues}
          patients={patients}
          onUpdateStatus={onUpdateStatus}
          onCallQueue={onCallQueue}
          onRecallQueue={onRecallQueue}
        />
      </div>
      
      <DashboardSidebar completedQueuesLength={completedQueues.length} />
    </div>
  );
};

export default DashboardContent;
