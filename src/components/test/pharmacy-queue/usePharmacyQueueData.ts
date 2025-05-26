
import { useCallback } from 'react';
import { useQueues } from '@/hooks/useQueues';
import { usePatients } from '@/hooks/usePatients';
import { useServicePoints } from '@/hooks/useServicePoints';
import { createLogger } from '@/utils/logger';
import { toast } from 'sonner';
import { useQueueFiltering } from './hooks/useQueueFiltering';
import { usePatientData } from './hooks/usePatientData';
import { useQueueActions } from './hooks/useQueueActions';

const logger = createLogger('usePharmacyQueueData');

interface UsePharmacyQueueDataProps {
  servicePointId: string;
  refreshTrigger?: number;
}

export const usePharmacyQueueData = ({ servicePointId, refreshTrigger = 0 }: UsePharmacyQueueDataProps) => {
  const { 
    queues, 
    updateQueueStatus, 
    callQueue, 
    recallQueue,
    fetchQueues,
    transferQueueToServicePoint,
    returnSkippedQueueToWaiting,
    loading: globalLoading
  } = useQueues();
  
  const { patients } = usePatients();
  const { servicePoints } = useServicePoints();

  // Use filtering hook
  const { selectedServicePoint, servicePointQueues, queuesByStatus } = useQueueFiltering({
    queues,
    servicePointId,
    servicePoints
  });

  // Use patient data hook
  const { getPatientName, getPatientData } = usePatientData({ patients });

  // Use queue actions hook
  const {
    handleCallQueue,
    handleUpdateStatus,
    handleRecallQueue,
    handleHoldQueue,
    handleTransferQueue,
    handleReturnToWaiting
  } = useQueueActions({
    selectedServicePoint,
    servicePointQueues,
    servicePoints,
    callQueue,
    updateQueueStatus,
    recallQueue,
    transferQueueToServicePoint,
    returnSkippedQueueToWaiting
  });

  // Simple manual refresh function
  const handleManualRefresh = useCallback(async () => {
    logger.debug(`Manual refresh requested for service point ${selectedServicePoint?.code}`);
    try {
      await fetchQueues(true);
      toast.success('รีเฟรชข้อมูลเรียบร้อยแล้ว');
    } catch (error) {
      logger.error(`Error refreshing data:`, error);
      toast.error('ไม่สามารถรีเฟรชข้อมูลได้');
    }
  }, [fetchQueues, selectedServicePoint]);

  return {
    selectedServicePoint,
    queuesByStatus,
    getPatientName,
    getPatientData,
    handleCallQueue,
    handleUpdateStatus,
    handleRecallQueue,
    handleHoldQueue,
    handleTransferQueue,
    handleReturnToWaiting,
    handleManualRefresh,
    isLoading: globalLoading,
    servicePoints
  };
};
