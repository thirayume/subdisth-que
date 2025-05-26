
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePharmacyQueueData } from './usePharmacyQueueData';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatQueueNumber } from '@/utils/queueFormatters';

interface PharmacyQueueTabsProps {
  servicePointId: string;
  refreshTrigger: number;
}

const PharmacyQueueTabs: React.FC<PharmacyQueueTabsProps> = ({
  servicePointId,
  refreshTrigger
}) => {
  const {
    queuesByStatus,
    getPatientName,
    handleCallQueue,
    handleUpdateStatus,
    handleRecallQueue,
    handleManualRefresh,
    isLoading
  } = usePharmacyQueueData({ servicePointId, refreshTrigger });

  // Use manual refresh when refreshTrigger changes
  React.useEffect(() => {
    if (refreshTrigger > 0) {
      handleManualRefresh();
    }
  }, [refreshTrigger, handleManualRefresh]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="waiting" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="waiting" className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          รอ
          <Badge variant="secondary">{queuesByStatus.waiting.length}</Badge>
        </TabsTrigger>
        <TabsTrigger value="active" className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          กำลังบริการ
          <Badge variant="secondary">{queuesByStatus.active.length}</Badge>
        </TabsTrigger>
        <TabsTrigger value="completed" className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          เสร็จสิ้น
          <Badge variant="secondary">{queuesByStatus.completed.length}</Badge>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="waiting" className="space-y-2">
        {queuesByStatus.waiting.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            ไม่มีคิวที่รอ
          </div>
        ) : (
          queuesByStatus.waiting.map((queue) => (
            <div key={queue.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <div className="font-medium">
                  {formatQueueNumber(queue.type, queue.number)}
                </div>
                <div className="text-sm text-gray-600">
                  {getPatientName(queue.patient_id)}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleCallQueue(queue.id)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  เรียกคิว
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUpdateStatus(queue.id, 'SKIPPED')}
                >
                  ข้าม
                </Button>
              </div>
            </div>
          ))
        )}
      </TabsContent>

      <TabsContent value="active" className="space-y-2">
        {queuesByStatus.active.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            ไม่มีคิวที่กำลังบริการ
          </div>
        ) : (
          queuesByStatus.active.map((queue) => (
            <div key={queue.id} className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
              <div className="flex-1">
                <div className="font-medium">
                  {formatQueueNumber(queue.type, queue.number)}
                </div>
                <div className="text-sm text-gray-600">
                  {getPatientName(queue.patient_id)}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRecallQueue(queue.id)}
                >
                  เรียกซ้ำ
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleUpdateStatus(queue.id, 'COMPLETED')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  เสร็จสิ้น
                </Button>
              </div>
            </div>
          ))
        )}
      </TabsContent>

      <TabsContent value="completed" className="space-y-2">
        {queuesByStatus.completed.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            ไม่มีคิวที่เสร็จสิ้น
          </div>
        ) : (
          queuesByStatus.completed.slice(0, 10).map((queue) => (
            <div key={queue.id} className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
              <div className="flex-1">
                <div className="font-medium">
                  {formatQueueNumber(queue.type, queue.number)}
                </div>
                <div className="text-sm text-gray-600">
                  {getPatientName(queue.patient_id)}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUpdateStatus(queue.id, 'WAITING')}
                >
                  นำกลับมารอ
                </Button>
              </div>
            </div>
          ))
        )}
      </TabsContent>
    </Tabs>
  );
};

export default PharmacyQueueTabs;
