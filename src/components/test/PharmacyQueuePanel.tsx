
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

const PharmacyQueuePanel: React.FC<PharmacyQueuePanelProps> = ({
  servicePointId,
  title,
  refreshTrigger = 0
}) => {
  const { 
    queues, 
    updateQueueStatus, 
    callQueue, 
    recallQueue,
    transferQueueToServicePoint,
    putQueueOnHold,
    returnSkippedQueueToWaiting,
    fetchQueues,
    loading
  } = useQueues();
  
  const { patients } = usePatients();
  const { servicePoints } = useServicePoints();

  // Memoize the selected service point to prevent unnecessary re-renders
  const selectedServicePoint = useMemo(() => {
    return servicePoints.find(sp => sp.id === servicePointId);
  }, [servicePoints, servicePointId]);

  // Stable refresh function
  const refreshData = useCallback(async () => {
    if (refreshTrigger > 0) {
      logger.debug(`Refresh trigger fired for service point ${selectedServicePoint?.code}: ${refreshTrigger}`);
      try {
        await fetchQueues();
        logger.debug(`Successfully refreshed data for service point ${selectedServicePoint?.code}`);
      } catch (error) {
        logger.error(`Error refreshing data for service point ${selectedServicePoint?.code}:`, error);
      }
    }
  }, [refreshTrigger, fetchQueues, selectedServicePoint?.code]);

  // Handle refresh trigger changes
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Memoize filtered queues with detailed logging
  const servicePointQueues = useMemo(() => {
    if (!selectedServicePoint) {
      logger.debug('No selected service point, returning empty array');
      return [];
    }
    
    const filtered = queues.filter(q => q.service_point_id === selectedServicePoint.id);
    logger.debug(`Filtered queues for service point ${selectedServicePoint.code}:`, {
      totalQueues: queues.length,
      filteredQueues: filtered.length,
      servicePointId: selectedServicePoint.id,
      queueDetails: filtered.map(q => ({ 
        id: q.id, 
        number: q.number, 
        status: q.status, 
        type: q.type,
        service_point_id: q.service_point_id 
      }))
    });
    
    return filtered;
  }, [queues, selectedServicePoint]);

  // Memoize queue status groups
  const { waitingQueues, activeQueues, completedQueues } = useMemo(() => {
    return {
      waitingQueues: servicePointQueues.filter(q => q.status === 'WAITING'),
      activeQueues: servicePointQueues.filter(q => q.status === 'ACTIVE'),
      completedQueues: servicePointQueues.filter(q => q.status === 'COMPLETED')
    };
  }, [servicePointQueues]);

  // Log queue counts for debugging
  useEffect(() => {
    if (selectedServicePoint) {
      logger.debug(`Queue counts for ${selectedServicePoint.code}:`, {
        waiting: waitingQueues.length,
        active: activeQueues.length,
        completed: completedQueues.length,
        total: servicePointQueues.length,
        refreshTrigger
      });
    }
  }, [waitingQueues.length, activeQueues.length, completedQueues.length, servicePointQueues.length, selectedServicePoint, refreshTrigger]);

  // Stable patient name getter
  const getPatientName = useCallback((patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? patient.name : 'ไม่พบข้อมูลผู้ป่วย';
  }, [patients]);

  // Stable queue action handlers
  const handleCallQueue = useCallback(async (queueId: string): Promise<any> => {
    if (!selectedServicePoint) return null;
    logger.debug(`Calling queue ${queueId} for service point ${selectedServicePoint.code}`);
    const result = await callQueue(queueId, selectedServicePoint.id);
    return result;
  }, [selectedServicePoint, callQueue]);

  const handleUpdateStatus = useCallback(async (queueId: string, status: any) => {
    logger.debug(`Updating queue ${queueId} status to ${status}`);
    const result = await updateQueueStatus(queueId, status);
    return result;
  }, [updateQueueStatus]);

  const handleRecallQueue = useCallback((queueId: string) => {
    logger.debug(`Recalling queue ${queueId}`);
    recallQueue(queueId);
  }, [recallQueue]);

  if (!selectedServicePoint) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">ไม่พบจุดบริการ</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">กำลังโหลด...</p>
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
                  onUpdateStatus={handleUpdateStatus}
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
                  onUpdateStatus={handleUpdateStatus}
                  onRecallQueue={handleRecallQueue}
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
