
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useQueues } from '@/hooks/useQueues';
import { usePatients } from '@/hooks/usePatients';
import { useServicePoints } from '@/hooks/useServicePoints';
import { useGlobalRealtime } from '@/hooks/useGlobalRealtime';
import { ServicePoint } from '@/integrations/supabase/schema';
import { createLogger } from '@/utils/logger';
import { formatQueueNumber } from '@/utils/queueFormatters';
import { toast } from 'sonner';

const logger = createLogger('usePharmacyQueueData');

interface UsePharmacyQueueDataProps {
  servicePointId: string;
  refreshTrigger?: number;
}

export const usePharmacyQueueData = ({ servicePointId, refreshTrigger = 0 }: UsePharmacyQueueDataProps) => {
  const [localLoading, setLocalLoading] = useState(false);
  
  const { 
    queues, 
    updateQueueStatus, 
    callQueue, 
    recallQueue,
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
        await fetchQueues(true); // Force refresh
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

  // Use global realtime manager for this service point
  useGlobalRealtime(
    `pharmacy-queue-${servicePointId}`,
    useCallback(() => {
      logger.debug(`Queue change detected for service point ${servicePointId}`);
      // No need to fetch here as global manager already handles it
    }, [servicePointId]),
    servicePointId,
    true
  );

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

  // Enhanced queue action handlers with proper formatting
  const handleCallQueue = useCallback(async (queueId: string): Promise<any> => {
    if (!selectedServicePoint) return null;
    
    const queue = servicePointQueues.find(q => q.id === queueId);
    const formattedNumber = queue ? formatQueueNumber(queue.type as any, queue.number) : queueId;
    
    logger.debug(`Calling queue ${formattedNumber} for service point ${selectedServicePoint.code}`);
    
    try {
      const result = await callQueue(queueId, selectedServicePoint.id);
      if (result) {
        toast.success(`เรียกคิว ${formattedNumber} เรียบร้อยแล้ว`);
      }
      return result;
    } catch (error) {
      toast.error(`ไม่สามารถเรียกคิว ${formattedNumber} ได้`);
      throw error;
    }
  }, [selectedServicePoint, callQueue, servicePointQueues]);

  const handleUpdateStatus = useCallback(async (queueId: string, status: any) => {
    const queue = servicePointQueues.find(q => q.id === queueId);
    const formattedNumber = queue ? formatQueueNumber(queue.type as any, queue.number) : queueId;
    
    logger.debug(`Updating queue ${formattedNumber} status to ${status}`);
    
    try {
      const result = await updateQueueStatus(queueId, status);
      if (result) {
        let message = '';
        switch (status) {
          case 'COMPLETED':
            message = `คิว ${formattedNumber} เสร็จสิ้นการให้บริการแล้ว`;
            break;
          case 'SKIPPED':
            message = `คิว ${formattedNumber} ถูกข้ามแล้ว`;
            break;
          case 'WAITING':
            message = `คิว ${formattedNumber} ถูกนำกลับมารอคิวแล้ว`;
            break;
          default:
            message = `อัปเดตสถานะคิว ${formattedNumber} เรียบร้อยแล้ว`;
        }
        toast.success(message);
      }
      return result;
    } catch (error) {
      toast.error(`ไม่สามารถอัปเดตสถานะคิว ${formattedNumber} ได้`);
      throw error;
    }
  }, [updateQueueStatus, servicePointQueues]);

  const handleRecallQueue = useCallback((queueId: string) => {
    const queue = servicePointQueues.find(q => q.id === queueId);
    const formattedNumber = queue ? formatQueueNumber(queue.type as any, queue.number) : queueId;
    
    logger.debug(`Recalling queue ${formattedNumber}`);
    recallQueue(queueId);
    toast.info(`เรียกซ้ำคิว ${formattedNumber}`);
  }, [recallQueue, servicePointQueues]);

  // Loading state check
  const isLoading = globalLoading || localLoading;

  return {
    selectedServicePoint,
    queuesByStatus,
    getPatientName,
    handleCallQueue,
    handleUpdateStatus,
    handleRecallQueue,
    isLoading,
    servicePoints
  };
};
