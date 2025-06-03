
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
    queues = [], 
    updateQueueStatus, 
    callQueue, 
    recallQueue,
    fetchQueues,
    removeQueue,
    transferQueueToServicePoint: baseTransferQueue,
    returnSkippedQueueToWaiting: baseReturnQueue,
    loading: globalLoading
  } = useQueues();
  
  const { patients = [] } = usePatients();
  const { servicePoints = [] } = useServicePoints();

  // Show ALL queues, not filtered by service point (like queue management page)
  const allQueues = Array.isArray(queues) ? queues.filter(queue => {
    const isRelevantStatus = ['WAITING', 'ACTIVE', 'COMPLETED', 'SKIPPED'].includes(queue.status);
    const isTodayQueue = queue.queue_date === new Date().toISOString().slice(0, 10);
    
    return isRelevantStatus && isTodayQueue;
  }) : [];

  const selectedServicePoint = servicePoints.find(sp => sp.id === servicePointId) || null;

  // Group ALL queues by status for the pharmacy interface (not filtered by service point)
  const queuesByStatus = {
    waiting: allQueues.filter(q => q.status === 'WAITING' && !q.paused_at),
    active: allQueues.filter(q => q.status === 'ACTIVE'),
    completed: allQueues.filter(q => q.status === 'COMPLETED'),
    skipped: allQueues.filter(q => q.status === 'SKIPPED'),
    paused: allQueues.filter(q => q.status === 'WAITING' && q.paused_at)
  };

  // Use patient data hook with safe defaults
  const { getPatientName, getPatientData } = usePatientData({ 
    patients: Array.isArray(patients) ? patients : [] 
  });

  // Create wrapper functions that match the expected signatures
  const wrappedTransferQueue = useCallback(async (queueId: string, targetServicePointId: string): Promise<void> => {
    if (!selectedServicePoint) return;
    
    try {
      await baseTransferQueue(queueId, selectedServicePoint.id, targetServicePointId);
    } catch (error) {
      logger.error('Error in transfer queue wrapper:', error);
      throw error;
    }
  }, [baseTransferQueue, selectedServicePoint]);

  const wrappedReturnQueue = useCallback(async (queueId: string): Promise<void> => {
    try {
      await baseReturnQueue(queueId);
    } catch (error) {
      logger.error('Error in return queue wrapper:', error);
      throw error;
    }
  }, [baseReturnQueue]);

  const wrappedRemoveQueue = useCallback(async (queueId: string): Promise<void> => {
    try {
      await removeQueue(queueId);
    } catch (error) {
      logger.error('Error in remove queue wrapper:', error);
      throw error;
    }
  }, [removeQueue]);

  // Use queue actions hook with safe defaults - pass all queues, not filtered
  const {
    handleCallQueue,
    handleUpdateStatus,
    handleRecallQueue,
    handleHoldQueue,
    handleTransferQueue,
    handleReturnToWaiting,
    handleCancelQueue
  } = useQueueActions({
    selectedServicePoint,
    servicePointQueues: Array.isArray(allQueues) ? allQueues : [],
    servicePoints: Array.isArray(servicePoints) ? servicePoints : [],
    callQueue,
    updateQueueStatus,
    recallQueue,
    transferQueueToServicePoint: wrappedTransferQueue,
    returnSkippedQueueToWaiting: wrappedReturnQueue,
    removeQueue: wrappedRemoveQueue
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
    handleCancelQueue,
    handleManualRefresh,
    isLoading: globalLoading,
    servicePoints: Array.isArray(servicePoints) ? servicePoints : []
  };
};
