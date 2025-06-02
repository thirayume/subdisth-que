
import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Queue, Patient, ServicePoint } from '@/integrations/supabase/schema';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, CheckCircle, SkipForward } from 'lucide-react';
import QueueList from '../QueueList';
import { QueueStatus } from '@/integrations/supabase/schema';
import { QueueTransferDialog } from '@/components/queue/transfer';
import { QueueType } from '@/hooks/useQueueTypes';

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
  selectedServicePoint,
  servicePoints,
  getIntelligentServicePointSuggestion
}) => {
  const [activeTab, setActiveTab] = React.useState('waiting');

  // State for transfer dialog
  const [transferDialogOpen, setTransferDialogOpen] = React.useState(false);
  const [queueToTransfer, setQueueToTransfer] = React.useState<Queue | null>(null);

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
        {/* Enhanced Tab Header */}
        <div className="border-b bg-gray-50/50 px-6 py-3">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
            <TabsTrigger value="waiting" className="flex items-center gap-2 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700">
              <Clock className="w-4 h-4" />
              รอดำเนินการ
              <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                {waitingQueues.length}
              </Badge>
            </TabsTrigger>
            
            <TabsTrigger value="active" className="flex items-center gap-2 data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
              <Users className="w-4 h-4" />
              กำลังให้บริการ
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                {activeQueues.length}
              </Badge>
            </TabsTrigger>
            
            <TabsTrigger value="completed" className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              <CheckCircle className="w-4 h-4" />
              เสร็จสิ้น
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {completedQueues.length}
              </Badge>
            </TabsTrigger>
            
            <TabsTrigger value="skipped" className="flex items-center gap-2 data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700">
              <SkipForward className="w-4 h-4" />
              ข้าม
              <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                {skippedQueues.length}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </div>
        
        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          <TabsContent value="waiting" className="h-full m-0">
            <Card className="h-full border-0 shadow-none">
              <CardContent className="h-full p-0">
                <QueueList
                  queues={waitingQueues}
                  getPatientName={getPatientName}
                  onUpdateStatus={onUpdateStatus}
                  onCallQueue={onCallQueue}
                  status="WAITING"
                  selectedServicePoint={selectedServicePoint}
                  servicePoints={servicePoints}
                  getIntelligentServicePointSuggestion={getIntelligentServicePointSuggestion}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="active" className="h-full m-0">
            <Card className="h-full border-0 shadow-none">
              <CardContent className="h-full p-0">
                <QueueList
                  queues={activeQueues}
                  getPatientName={getPatientName}
                  onUpdateStatus={onUpdateStatus}
                  onRecallQueue={onRecallQueue}
                  onTransferQueue={onTransferQueue ? handleTransferQueue : undefined}
                  onHoldQueue={onHoldQueue ? handleHoldQueue : undefined}
                  status="ACTIVE"
                  selectedServicePoint={selectedServicePoint}
                  servicePoints={servicePoints}
                  getIntelligentServicePointSuggestion={getIntelligentServicePointSuggestion}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="completed" className="h-full m-0">
            <Card className="h-full border-0 shadow-none">
              <CardContent className="h-full p-0">
                <QueueList
                  queues={completedQueues}
                  getPatientName={getPatientName}
                  status="COMPLETED"
                  selectedServicePoint={selectedServicePoint}
                  servicePoints={servicePoints}
                  getIntelligentServicePointSuggestion={getIntelligentServicePointSuggestion}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="skipped" className="h-full m-0">
            <Card className="h-full border-0 shadow-none">
              <CardContent className="h-full p-0">
                <QueueList
                  queues={skippedQueues}
                  getPatientName={getPatientName}
                  onUpdateStatus={onUpdateStatus}
                  onReturnToWaiting={onReturnToWaiting}
                  status="SKIPPED"
                  selectedServicePoint={selectedServicePoint}
                  servicePoints={servicePoints}
                  getIntelligentServicePointSuggestion={getIntelligentServicePointSuggestion}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>

      {/* Transfer Dialog */}
      {onTransferQueue && (
        <QueueTransferDialog
          queue={queueToTransfer}
          open={transferDialogOpen}
          onOpenChange={setTransferDialogOpen}
          servicePoints={servicePoints}
          queueTypes={queueTypes}
          currentServicePointId={queueToTransfer?.service_point_id}
          onTransfer={onTransferQueue}
        />
      )}
    </div>
  );
};

export default QueueTabsContainer;
