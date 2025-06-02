
import * as React from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Queue, Patient, ServicePoint } from '@/integrations/supabase/schema';
import { QueueStatus } from '@/integrations/supabase/schema';
import { QueueType } from '@/hooks/useQueueTypes';
import QueueTabsHeader from './QueueTabsHeader';
import QueueTabContent from './QueueTabContent';
import QueueTransferDialogContainer from './QueueTransferDialogContainer';

interface QueueTabsContainerProps {
  waitingQueues: Queue[];
  activeQueues: Queue[];
  completedQueues: Queue[];
  skippedQueues: Queue[];
  patients: Patient[];
  queueTypes: QueueType[];
  onUpdateStatus: (queueId: string, status: QueueStatus) => Promise<Queue | null>;
  onCallQueue: (queueId: string, manualServicePointId?: string) => Promise<Queue | null>;
  onRecallQueue: (queueId: string) => void;
  onTransferQueue?: (
    queueId: string, 
    sourceServicePointId: string,
    targetServicePointId: string,
    notes?: string,
    newQueueType?: string
  ) => Promise<boolean>;
  onHoldQueue?: (queueId: string, servicePointId: string, reason?: string) => Promise<boolean>;
  onReturnToWaiting?: (queueId: string) => Promise<boolean>;
  onViewPatientInfo?: (patientId: string) => void;
  selectedServicePoint?: ServicePoint | null;
  servicePoints: ServicePoint[];
  getIntelligentServicePointSuggestion?: (queue: Queue) => ServicePoint | null;
}

const QueueTabsContainer: React.FC<QueueTabsContainerProps> = ({
  waitingQueues,
  activeQueues,
  completedQueues,
  skippedQueues,
  patients,
  queueTypes,
  onUpdateStatus,
  onCallQueue,
  onRecallQueue,
  onTransferQueue,
  onHoldQueue,
  onReturnToWaiting,
  onViewPatientInfo,
  selectedServicePoint,
  servicePoints,
  getIntelligentServicePointSuggestion
}) => {
  const [activeTab, setActiveTab] = React.useState('waiting');
  const [transferDialogOpen, setTransferDialogOpen] = React.useState(false);
  const [queueToTransfer, setQueueToTransfer] = React.useState<Queue | null>(null);

  // Filter paused queues from waiting queues (queues with paused_at timestamp)
  const pausedQueues = waitingQueues.filter(q => q.paused_at);
  const actualWaitingQueues = waitingQueues.filter(q => !q.paused_at);

  // Get patient name by ID
  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? patient.name : 'Unknown';
  };

  // Handle transfer queue button click
  const handleTransferQueue = (queueId: string) => {
    const queue = activeQueues.find(q => q.id === queueId);
    if (queue) {
      setQueueToTransfer(queue);
      setTransferDialogOpen(true);
    }
  };

  // Handle hold queue
  const handleHoldQueue = (queueId: string) => {
    const queue = activeQueues.find(q => q.id === queueId);
    if (onHoldQueue && queue?.service_point_id) {
      onHoldQueue(queueId, queue.service_point_id);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <QueueTabsHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          waitingQueues={actualWaitingQueues}
          activeQueues={activeQueues}
          completedQueues={completedQueues}
          skippedQueues={skippedQueues}
          pausedQueues={pausedQueues}
        />
        
        <div className="flex-1 overflow-hidden">
          <TabsContent value="waiting" className="h-full m-0">
            <QueueTabContent
              queues={actualWaitingQueues}
              patients={patients}
              status="WAITING"
              getPatientName={getPatientName}
              onUpdateStatus={onUpdateStatus}
              onCallQueue={onCallQueue}
              onViewPatientInfo={onViewPatientInfo}
              selectedServicePoint={selectedServicePoint}
              servicePoints={servicePoints}
              getIntelligentServicePointSuggestion={getIntelligentServicePointSuggestion}
            />
          </TabsContent>
          
          <TabsContent value="active" className="h-full m-0">
            <QueueTabContent
              queues={activeQueues}
              patients={patients}
              status="ACTIVE"
              getPatientName={getPatientName}
              onUpdateStatus={onUpdateStatus}
              onRecallQueue={onRecallQueue}
              onTransferQueue={onTransferQueue ? handleTransferQueue : undefined}
              onHoldQueue={onHoldQueue ? handleHoldQueue : undefined}
              onViewPatientInfo={onViewPatientInfo}
              selectedServicePoint={selectedServicePoint}
              servicePoints={servicePoints}
              getIntelligentServicePointSuggestion={getIntelligentServicePointSuggestion}
            />
          </TabsContent>

          <TabsContent value="paused" className="h-full m-0">
            <QueueTabContent
              queues={pausedQueues}
              patients={patients}
              status="WAITING"
              getPatientName={getPatientName}
              onUpdateStatus={onUpdateStatus}
              onCallQueue={onCallQueue}
              onReturnToWaiting={onReturnToWaiting}
              onViewPatientInfo={onViewPatientInfo}
              selectedServicePoint={selectedServicePoint}
              servicePoints={servicePoints}
              getIntelligentServicePointSuggestion={getIntelligentServicePointSuggestion}
            />
          </TabsContent>
          
          <TabsContent value="skipped" className="h-full m-0">
            <QueueTabContent
              queues={skippedQueues}
              patients={patients}
              status="SKIPPED"
              getPatientName={getPatientName}
              onUpdateStatus={onUpdateStatus}
              onReturnToWaiting={onReturnToWaiting}
              onViewPatientInfo={onViewPatientInfo}
              selectedServicePoint={selectedServicePoint}
              servicePoints={servicePoints}
              getIntelligentServicePointSuggestion={getIntelligentServicePointSuggestion}
            />
          </TabsContent>

          <TabsContent value="completed" className="h-full m-0">
            <QueueTabContent
              queues={completedQueues}
              patients={patients}
              status="COMPLETED"
              getPatientName={getPatientName}
              onViewPatientInfo={onViewPatientInfo}
              selectedServicePoint={selectedServicePoint}
              servicePoints={servicePoints}
              getIntelligentServicePointSuggestion={getIntelligentServicePointSuggestion}
            />
          </TabsContent>
        </div>
      </Tabs>

      <QueueTransferDialogContainer
        queueToTransfer={queueToTransfer}
        transferDialogOpen={transferDialogOpen}
        onOpenChange={setTransferDialogOpen}
        servicePoints={servicePoints}
        queueTypes={queueTypes}
        onTransfer={onTransferQueue}
      />
    </div>
  );
};

export default QueueTabsContainer;
