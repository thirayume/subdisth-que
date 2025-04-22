
import React from 'react';
import { Queue, QueueStatus, Patient } from '@/integrations/supabase/schema';
import QueueTabs from '@/components/dashboard/QueueTabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface QueueTabsContainerProps {
  waitingQueues: Queue[];
  activeQueues: Queue[];
  completedQueues: Queue[];
  skippedQueues: Queue[];
  patients: Patient[];
  onUpdateStatus: (queueId: string, status: QueueStatus) => void;
  onCallQueue: (queueId: string) => void;
  onRecallQueue: (queueId: string) => void;
}

const QueueTabsContainer: React.FC<QueueTabsContainerProps> = ({
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
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm h-full overflow-hidden flex flex-col">
      <ScrollArea className="flex-1 overflow-auto">
        <div className="pr-4 pb-4">
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
      </ScrollArea>
    </div>
  );
};

export default QueueTabsContainer;
