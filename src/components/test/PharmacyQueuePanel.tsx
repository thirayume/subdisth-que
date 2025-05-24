
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQueues } from '@/hooks/useQueues';
import { usePatients } from '@/hooks/usePatients';
import { useServicePoints } from '@/hooks/useServicePoints';
import QueueList from '@/components/queue/QueueList';

interface PharmacyQueuePanelProps {
  servicePointId: string;
  title: string;
}

const PharmacyQueuePanel: React.FC<PharmacyQueuePanelProps> = ({
  servicePointId,
  title
}) => {
  const { 
    queues, 
    updateQueueStatus, 
    callQueue, 
    recallQueue,
    transferQueueToServicePoint,
    putQueueOnHold,
    returnSkippedQueueToWaiting
  } = useQueues();
  
  const { patients } = usePatients();
  const { servicePoints } = useServicePoints();

  const selectedServicePoint = servicePoints.find(sp => sp.id === servicePointId);

  // Filter queues for the selected service point
  const servicePointQueues = React.useMemo(() => {
    if (!selectedServicePoint) return [];
    return queues.filter(q => q.service_point_id === selectedServicePoint.id);
  }, [queues, selectedServicePoint]);

  const waitingQueues = servicePointQueues.filter(q => q.status === 'WAITING');
  const activeQueues = servicePointQueues.filter(q => q.status === 'ACTIVE');
  const completedQueues = servicePointQueues.filter(q => q.status === 'COMPLETED');

  // Get patient name by ID
  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? patient.name : 'ไม่พบข้อมูลผู้ป่วย';
  };

  const handleCallQueue = async (queueId: string): Promise<any> => {
    if (!selectedServicePoint) return null;
    return await callQueue(queueId, selectedServicePoint.id);
  };

  if (!selectedServicePoint) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">ไม่พบจุดบริการ</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-3 border-b flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-sm">{title}</h3>
            <p className="text-xs text-gray-500">{selectedServicePoint.code} - {selectedServicePoint.name}</p>
          </div>
          
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="outline" className="bg-orange-50 text-orange-700">
              รอ: {waitingQueues.length}
            </Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700">
              ให้บริการ: {activeQueues.length}
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="waiting" className="h-full flex flex-col">
          <div className="border-b px-2 flex-shrink-0">
            <TabsList className="h-8 text-xs">
              <TabsTrigger value="waiting" className="text-xs px-2">
                รอ ({waitingQueues.length})
              </TabsTrigger>
              <TabsTrigger value="active" className="text-xs px-2">
                ให้บริการ ({activeQueues.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="text-xs px-2">
                เสร็จ ({completedQueues.length})
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="flex-1 overflow-auto">
            <TabsContent value="waiting" className="mt-0 h-full">
              <div className="h-full overflow-auto">
                <QueueList
                  queues={waitingQueues}
                  getPatientName={getPatientName}
                  onUpdateStatus={updateQueueStatus}
                  onCallQueue={handleCallQueue}
                  status="WAITING"
                  selectedServicePoint={selectedServicePoint}
                  servicePoints={servicePoints}
                  showServicePointInfo={false}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="active" className="mt-0 h-full">
              <div className="h-full overflow-auto">
                <QueueList
                  queues={activeQueues}
                  getPatientName={getPatientName}
                  onUpdateStatus={updateQueueStatus}
                  onRecallQueue={recallQueue}
                  status="ACTIVE"
                  selectedServicePoint={selectedServicePoint}
                  servicePoints={servicePoints}
                  showServicePointInfo={false}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="completed" className="mt-0 h-full">
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
      </div>
    </div>
  );
};

export default PharmacyQueuePanel;
