
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Queue, ServicePoint } from '@/integrations/supabase/schema';
import QueueList from '@/components/queue/QueueList';

interface PharmacyQueueTabsProps {
  waitingQueues: Queue[];
  activeQueues: Queue[];
  completedQueues: Queue[];
  getPatientName: (patientId: string) => string;
  onUpdateStatus: (queueId: string, status: any) => Promise<any>;
  onCallQueue: (queueId: string) => Promise<any>;
  onRecallQueue: (queueId: string) => void;
  selectedServicePoint: ServicePoint;
  servicePoints: ServicePoint[];
}

const PharmacyQueueTabs: React.FC<PharmacyQueueTabsProps> = ({
  waitingQueues,
  activeQueues,
  completedQueues,
  getPatientName,
  onUpdateStatus,
  onCallQueue,
  onRecallQueue,
  selectedServicePoint,
  servicePoints
}) => {
  return (
    <Tabs defaultValue="waiting" className="h-full flex flex-col">
      <div className="border-b px-2 flex-shrink-0">
        <TabsList className="h-8 text-xs w-full">
          <TabsTrigger value="waiting" className="text-xs px-2 flex-1">
            รอ ({waitingQueues.length})
          </TabsTrigger>
          <TabsTrigger value="active" className="text-xs px-2 flex-1">
            ให้บริการ ({activeQueues.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="text-xs px-2 flex-1">
            เสร็จ ({completedQueues.length})
          </TabsTrigger>
        </TabsList>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <TabsContent value="waiting" className="mt-0 h-full overflow-hidden">
          <div className="h-full overflow-auto">
            <QueueList
              queues={waitingQueues}
              getPatientName={getPatientName}
              onUpdateStatus={onUpdateStatus}
              onCallQueue={onCallQueue}
              status="WAITING"
              selectedServicePoint={selectedServicePoint}
              servicePoints={servicePoints}
              showServicePointInfo={false}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="active" className="mt-0 h-full overflow-hidden">
          <div className="h-full overflow-auto">
            <QueueList
              queues={activeQueues}
              getPatientName={getPatientName}
              onUpdateStatus={onUpdateStatus}
              onRecallQueue={onRecallQueue}
              status="ACTIVE"
              selectedServicePoint={selectedServicePoint}
              servicePoints={servicePoints}
              showServicePointInfo={false}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="completed" className="mt-0 h-full overflow-hidden">
          <div className="h-full overflow-auto">
            <QueueList
              queues={completedQueues}
              getPatientName={getPatientName}
              status="COMPLETED"
              selectedServicePoint={selectedServicePoint}
              servicePoints={servicePoints}
              showServicePointInfo={false}
            />
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default PharmacyQueueTabs;
