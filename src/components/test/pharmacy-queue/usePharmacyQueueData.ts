
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useQueues } from '@/hooks/useQueues';
import { usePatients } from '@/hooks/usePatients';
import { useServicePoints } from '@/hooks/useServicePoints';
import { ServicePoint } from '@/integrations/supabase/schema';
import { createLogger } from '@/utils/logger';

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
