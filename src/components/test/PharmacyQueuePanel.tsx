
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { useQueues } from '@/hooks/useQueues';
import { usePatients } from '@/hooks/usePatients';
import { useServicePoints } from '@/hooks/useServicePoints';
import QueueList from '@/components/queue/QueueList';
import { createLogger } from '@/utils/logger';

const logger = createLogger('PharmacyQueuePanel');

interface PharmacyQueuePanelProps {
  servicePointId: string;
  title: string;
  refreshTrigger?: number;
}

const PharmacyQueuePanel: React.FC<PharmacyQueuePanelProps> = React.memo(({
  servicePointId,
  title,
  refreshTrigger = 0
}) => {
  const [localLoading, setLocalLoading] = useState(false);
  
  const { 
    queues, 
    updateQueueStatus, 
    callQueue, 
    recallQueue,
    transferQueueToServicePoint,
    putQueueOnHold,
    returnSkippedQueueToWaiting,
    fetchQueues,
    loading: globalLoading
  } = useQueues();
  
  const { patients } = usePatients();
  const { servicePoints } = useServicePoints();

  // Memoize the selected service point
  const selectedServicePoint = useMemo(() => {
    return servicePoints.find(sp => sp.id === servicePointId);
  }, [servicePoints, servicePointId]);

  // Optimized refresh function with local loading state
  const refreshData = useCallback(async () => {
    if (refreshTrigger > 0 && selectedServicePoint) {
      logger.debug(`Refresh trigger ${refreshTrigger} for service point ${selectedServicePoint.code}`);
      setLocalLoading(true);
      try {
        await fetchQueues();
        logger.debug(`Successfully refreshed data for service point ${selectedServicePoint.code}`);
      } catch (error) {
        logger.error(`Error refreshing data for service point ${selectedServicePoint.code}:`, error);
      } finally {
        setLocalLoading(false);
      }
    }
  }, [refreshTrigger, fetchQueues, selectedServicePoint]);

  // Handle refresh trigger changes with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      refreshData();
    }, 100); // Small delay to batch rapid changes

    return () => clearTimeout(timeoutId);
  }, [refreshData]);

  // Memoize filtered queues with optimized filtering
  const servicePointQueues = useMemo(() => {
    if (!selectedServicePoint) {
      return [];
    }
    
    const filtered = queues.filter(q => q.service_point_id === selectedServicePoint.id);
    logger.debug(`Service point ${selectedServicePoint.code} has ${filtered.length} queues`);
    
    return filtered;
  }, [queues, selectedServicePoint]);

  // Memoize queue status groups
  const queuesByStatus = useMemo(() => {
    const waiting = servicePointQueues.filter(q => q.status === 'WAITING');
    const active = servicePointQueues.filter(q => q.status === 'ACTIVE');
    const completed = servicePointQueues.filter(q => q.status === 'COMPLETED');
    
    return { waiting, active, completed };
  }, [servicePointQueues]);

  // Stable patient name getter
  const getPatientName = useCallback((patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? patient.name : 'ไม่พบข้อมูลผู้ป่วย';
  }, [patients]);

  // Optimized queue action handlers
  const handleCallQueue = useCallback(async (queueId: string): Promise<any> => {
    if (!selectedServicePoint) return null;
    logger.debug(`Calling queue ${queueId} for service point ${selectedServicePoint.code}`);
    return await callQueue(queueId, selectedServicePoint.id);
  }, [selectedServicePoint, callQueue]);

  const handleUpdateStatus = useCallback(async (queueId: string, status: any) => {
    logger.debug(`Updating queue ${queueId} status to ${status}`);
    return await updateQueueStatus(queueId, status);
  }, [updateQueueStatus]);

  const handleRecallQueue = useCallback((queueId: string) => {
    logger.debug(`Recalling queue ${queueId}`);
    recallQueue(queueId);
  }, [recallQueue]);

  // Loading state check
  const isLoading = globalLoading || localLoading;

  if (!selectedServicePoint) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-sm">ไม่พบจุดบริการ</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-3 border-b flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate">{title}</h3>
            <p className="text-xs text-gray-500 truncate">
              {selectedServicePoint.code} - {selectedServicePoint.name}
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-xs ml-2">
            {isLoading && (
              <Loader2 className="w-3 h-3 animate-spin text-gray-500" />
            )}
            <Badge variant="outline" className="bg-orange-50 text-orange-700 text-xs">
              รอ: {queuesByStatus.waiting.length}
            </Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">
              ให้บริการ: {queuesByStatus.active.length}
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="waiting" className="h-full flex flex-col">
          <div className="border-b px-2 flex-shrink-0">
            <TabsList className="h-8 text-xs w-full">
              <TabsTrigger value="waiting" className="text-xs px-2 flex-1">
                รอ ({queuesByStatus.waiting.length})
              </TabsTrigger>
              <TabsTrigger value="active" className="text-xs px-2 flex-1">
                ให้บริการ ({queuesByStatus.active.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="text-xs px-2 flex-1">
                เสร็จ ({queuesByStatus.completed.length})
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="flex-1 overflow-hidden">
            <TabsContent value="waiting" className="mt-0 h-full overflow-hidden">
              <div className="h-full overflow-auto">
                <QueueList
                  queues={queuesByStatus.waiting}
                  getPatientName={getPatientName}
                  onUpdateStatus={handleUpdateStatus}
                  onCallQueue={handleCallQueue}
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
                  queues={queuesByStatus.active}
                  getPatientName={getPatientName}
                  onUpdateStatus={handleUpdateStatus}
                  onRecallQueue={handleRecallQueue}
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
                  queues={queuesByStatus.completed}
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
});

PharmacyQueuePanel.displayName = 'PharmacyQueuePanel';

export default PharmacyQueuePanel;
