
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import QueueList from '@/components/queue/QueueList';
import { Queue, QueueStatus, Patient } from '@/integrations/supabase/schema';

interface QueueTabsProps {
  waitingQueues: Queue[];
  activeQueues: Queue[];
  completedQueues: Queue[];
  skippedQueues: Queue[];
  patients: Patient[];
  onUpdateStatus: (queueId: string, status: QueueStatus) => void;
  onCallQueue: (queueId: string) => void;
  onRecallQueue: (queueId: string) => void;
}

const QueueTabs: React.FC<QueueTabsProps> = ({
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
    <Tabs defaultValue="waiting">
      <TabsList className="mb-4">
        <TabsTrigger value="waiting">รอดำเนินการ ({waitingQueues.length})</TabsTrigger>
        <TabsTrigger value="active">กำลังให้บริการ ({activeQueues.length})</TabsTrigger>
        <TabsTrigger value="completed">เสร็จสิ้น ({completedQueues.length})</TabsTrigger>
        <TabsTrigger value="skipped">ข้ามไปแล้ว ({skippedQueues.length})</TabsTrigger>
      </TabsList>
      
      <TabsContent value="waiting" className="animate-fade-in">
        <QueueList
          queues={waitingQueues}
          patients={patients}
          title="คิวที่รอดำเนินการ"
          emptyMessage="ไม่มีคิวที่รอดำเนินการ"
          onUpdateStatus={onUpdateStatus}
          onCallQueue={onCallQueue}
          onRecallQueue={onRecallQueue}
        />
      </TabsContent>
      
      <TabsContent value="active" className="animate-fade-in">
        <QueueList
          queues={activeQueues}
          patients={patients}
          title="คิวที่กำลังให้บริการ"
          emptyMessage="ไม่มีคิวที่กำลังให้บริการ"
          onUpdateStatus={onUpdateStatus}
          onCallQueue={onCallQueue}
          onRecallQueue={onRecallQueue}
        />
      </TabsContent>
      
      <TabsContent value="completed" className="animate-fade-in">
        <QueueList
          queues={completedQueues}
          patients={patients}
          title="คิวที่เสร็จสิ้นแล้ว"
          emptyMessage="ไม่มีคิวที่เสร็จสิ้น"
          onUpdateStatus={onUpdateStatus}
          onCallQueue={onCallQueue}
          onRecallQueue={onRecallQueue}
        />
      </TabsContent>
      
      <TabsContent value="skipped" className="animate-fade-in">
        <QueueList
          queues={skippedQueues}
          patients={patients}
          title="คิวที่ถูกข้าม"
          emptyMessage="ไม่มีคิวที่ถูกข้าม"
          onUpdateStatus={onUpdateStatus}
          onCallQueue={onCallQueue}
          onRecallQueue={onRecallQueue}
        />
      </TabsContent>
    </Tabs>
  );
};

export default QueueTabs;
