
import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Queue, Patient, ServicePoint } from '@/integrations/supabase/schema';
import { Card } from '@/components/ui/card';
import QueueList from '../QueueList';
import { QueueStatus } from '@/integrations/supabase/schema';

interface QueueTabsContainerProps {
  waitingQueues: Queue[];
  activeQueues: Queue[];
  completedQueues: Queue[];
  skippedQueues: Queue[];
  patients: Patient[];
  onUpdateStatus: (queueId: string, status: QueueStatus) => Promise<Queue | null>;
  onCallQueue: (queueId: string) => Promise<Queue | null>;
  onRecallQueue: (queueId: string) => void;
  selectedServicePoint?: ServicePoint | null;
}

const QueueTabsContainer: React.FC<QueueTabsContainerProps> = ({
  waitingQueues,
  activeQueues,
  completedQueues,
  skippedQueues,
  patients,
  onUpdateStatus,
  onCallQueue,
  onRecallQueue,
  selectedServicePoint
}) => {
  const [activeTab, setActiveTab] = React.useState('waiting');
  const waitingCount = waitingQueues.length;
  const activeCount = activeQueues.length;
  const completedCount = completedQueues.length;
  const skippedCount = skippedQueues.length;

  // Get patient name by ID
  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? patient.name : 'Unknown';
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
      <div className="border-b px-2">
        <TabsList className="h-12">
          <TabsTrigger value="waiting" className="relative">
            คิวที่รอดำเนินการ
            {waitingCount > 0 && (
              <span className="ml-2 rounded-full bg-primary text-primary-foreground text-xs px-2 py-0.5">
                {waitingCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="active" className="relative">
            กำลังให้บริการ
            {activeCount > 0 && (
              <span className="ml-2 rounded-full bg-green-500 text-white text-xs px-2 py-0.5">
                {activeCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed">
            เสร็จสิ้น
            {completedCount > 0 && (
              <span className="ml-2 rounded-full bg-gray-500 text-white text-xs px-2 py-0.5">
                {completedCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="skipped">
            ข้าม
            {skippedCount > 0 && (
              <span className="ml-2 rounded-full bg-amber-500 text-white text-xs px-2 py-0.5">
                {skippedCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
      </div>
      
      <div className="flex-1 overflow-auto p-2">
        <TabsContent value="waiting" className="mt-0 h-full">
          <Card className="h-full overflow-auto border-0 shadow-none">
            <QueueList
              queues={waitingQueues}
              getPatientName={getPatientName}
              onUpdateStatus={onUpdateStatus}
              onCallQueue={onCallQueue}
              status="WAITING"
              selectedServicePoint={selectedServicePoint}
            />
          </Card>
        </TabsContent>
        
        <TabsContent value="active" className="mt-0 h-full">
          <Card className="h-full overflow-auto border-0 shadow-none">
            <QueueList
              queues={activeQueues}
              getPatientName={getPatientName}
              onUpdateStatus={onUpdateStatus}
              onRecallQueue={onRecallQueue}
              status="ACTIVE"
              selectedServicePoint={selectedServicePoint}
            />
          </Card>
        </TabsContent>
        
        <TabsContent value="completed" className="mt-0 h-full">
          <Card className="h-full overflow-auto border-0 shadow-none">
            <QueueList
              queues={completedQueues}
              getPatientName={getPatientName}
              status="COMPLETED"
              selectedServicePoint={selectedServicePoint}
            />
          </Card>
        </TabsContent>
        
        <TabsContent value="skipped" className="mt-0 h-full">
          <Card className="h-full overflow-auto border-0 shadow-none">
            <QueueList
              queues={skippedQueues}
              getPatientName={getPatientName}
              onUpdateStatus={onUpdateStatus}
              status="SKIPPED"
              selectedServicePoint={selectedServicePoint}
            />
          </Card>
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default QueueTabsContainer;
