
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import QueueCard from '@/components/queue/QueueCard';
import QueueControls from '@/components/queue/QueueControls';
import PatientInfoDialog from '@/components/pharmacy/PatientInfoDialog';
import { Queue, ServicePoint } from '@/integrations/supabase/schema';
import { formatQueueNumber } from '@/utils/queueFormatters';
import { usePatients } from '@/hooks/usePatients';

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
  selectedServicePoint
}) => {
  const [patientInfoOpen, setPatientInfoOpen] = useState(false);
  const [selectedQueue, setSelectedQueue] = useState<Queue | null>(null);
  const { patients } = usePatients();

  const handleViewPatientInfo = (queue: Queue) => {
    setSelectedQueue(queue);
    setPatientInfoOpen(true);
  };

  const selectedPatient = selectedQueue ? patients.find(p => p.id === selectedQueue.patient_id) : null;
  const queueNumber = selectedQueue ? formatQueueNumber(selectedQueue.type as any, selectedQueue.number) : undefined;

  return (
    <>
      <Tabs defaultValue="waiting" className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-3 mx-4 mt-2">
          <TabsTrigger value="waiting" className="flex items-center gap-2">
            คิวรอ
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              {waitingQueues.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="active" className="flex items-center gap-2">
            กำลังให้บริการ
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {activeQueues.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            เสร็จสิ้น
            <Badge variant="secondary" className="bg-gray-100 text-gray-800">
              {completedQueues.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden px-4">
          <TabsContent value="waiting" className="h-full mt-2">
            <ScrollArea className="h-full">
              <div className="space-y-3 pb-4">
                {waitingQueues.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    ไม่มีคิวรอให้บริการ
                  </div>
                ) : (
                  waitingQueues.map((queue) => (
                    <div key={queue.id} className="space-y-2">
                      <QueueCard
                        queue={queue}
                        patientName={getPatientName(queue.patient_id)}
                        onCall={() => onCallQueue(queue.id)}
                      />
                      <QueueControls
                        queue={queue}
                        onUpdateStatus={onUpdateStatus}
                        onCallQueue={onCallQueue}
                        onRecallQueue={onRecallQueue}
                        patientName={getPatientName(queue.patient_id)}
                        counterName={selectedServicePoint?.code || "1"}
                      />
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="active" className="h-full mt-2">
            <ScrollArea className="h-full">
              <div className="space-y-3 pb-4">
                {activeQueues.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    ไม่มีคิวที่กำลังให้บริการ
                  </div>
                ) : (
                  activeQueues.map((queue) => (
                    <div key={queue.id} className="space-y-2">
                      <QueueCard
                        queue={queue}
                        patientName={getPatientName(queue.patient_id)}
                        onComplete={() => onUpdateStatus(queue.id, 'COMPLETED')}
                        onSkip={() => onUpdateStatus(queue.id, 'SKIPPED')}
                        onRecall={() => onRecallQueue(queue.id)}
                        onViewPatientInfo={() => handleViewPatientInfo(queue)}
                      />
                      <QueueControls
                        queue={queue}
                        onUpdateStatus={onUpdateStatus}
                        onCallQueue={onCallQueue}
                        onRecallQueue={onRecallQueue}
                        patientName={getPatientName(queue.patient_id)}
                        counterName={selectedServicePoint?.code || "1"}
                      />
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="completed" className="h-full mt-2">
            <ScrollArea className="h-full">
              <div className="space-y-3 pb-4">
                {completedQueues.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    ไม่มีคิวที่เสร็จสิ้นแล้ว
                  </div>
                ) : (
                  completedQueues.map((queue) => (
                    <QueueCard
                      key={queue.id}
                      queue={queue}
                      patientName={getPatientName(queue.patient_id)}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>

      <PatientInfoDialog
        open={patientInfoOpen}
        onOpenChange={setPatientInfoOpen}
        patient={selectedPatient || null}
        queueNumber={queueNumber}
      />
    </>
  );
};

export default PharmacyQueueTabs;
