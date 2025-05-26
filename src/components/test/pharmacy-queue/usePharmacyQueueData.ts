
import { useMemo, useCallback } from 'react';
import { useQueues } from '@/hooks/useQueues';
import { usePatients } from '@/hooks/usePatients';
import { useServicePoints } from '@/hooks/useServicePoints';
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
  const { 
    queues, 
    updateQueueStatus, 
    callQueue, 
    recallQueue,
    fetchQueues,
    transferQueueToServicePoint,
    putQueueOnHold,
    returnSkippedQueueToWaiting,
    loading: globalLoading
  } = useQueues();
  
  const { patients } = usePatients();
  const { servicePoints } = useServicePoints();

  // Memoize the selected service point
  const selectedServicePoint = useMemo(() => {
    return servicePoints.find(sp => sp.id === servicePointId);
  }, [servicePoints, servicePointId]);

  // Simple manual refresh function - only fetch when explicitly called
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
    const paused = servicePointQueues.filter(q => q.status === 'PAUSED');
    const skipped = servicePointQueues.filter(q => q.status === 'SKIPPED');
    
    return { waiting, active, completed, paused, skipped };
  }, [servicePointQueues]);

  // Stable patient name getter
  const getPatientName = useCallback((patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? patient.name : 'ไม่พบข้อมูลผู้ป่วย';
  }, [patients]);

  // Get patient data
  const getPatientData = useCallback((patientId: string) => {
    return patients.find(p => p.id === patientId) || null;
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
          case 'PAUSED':
            message = `คิว ${formattedNumber} ถูกพักแล้ว`;
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
    if (selectedServicePoint) {
      recallQueue(queueId, selectedServicePoint.id);
      toast.info(`เรียกซ้ำคิว ${formattedNumber}`);
    }
  }, [recallQueue, servicePointQueues, selectedServicePoint]);

  const handleHoldQueue = useCallback(async (queueId: string) => {
    const queue = servicePointQueues.find(q => q.id === queueId);
    const formattedNumber = queue ? formatQueueNumber(queue.type as any, queue.number) : queueId;
    
    try {
      if (selectedServicePoint) {
        await putQueueOnHold(queueId, selectedServicePoint.id, 'PAUSED');
        toast.success(`พักคิว ${formattedNumber} เรียบร้อยแล้ว`);
      }
    } catch (error) {
      toast.error(`ไม่สามารถพักคิว ${formattedNumber} ได้`);
    }
  }, [putQueueOnHold, servicePointQueues, selectedServicePoint]);

  const handleTransferQueue = useCallback(async (queueId: string, targetServicePointId: string) => {
    const queue = servicePointQueues.find(q => q.id === queueId);
    const formattedNumber = queue ? formatQueueNumber(queue.type as any, queue.number) : queueId;
    const targetServicePoint = servicePoints.find(sp => sp.id === targetServicePointId);
    
    try {
      await transferQueueToServicePoint(queueId, targetServicePointId);
      toast.success(`โอนคิว ${formattedNumber} ไปยัง ${targetServicePoint?.name || 'จุดบริการอื่น'} เรียบร้อยแล้ว`);
    } catch (error) {
      toast.error(`ไม่สามารถโอนคิว ${formattedNumber} ได้`);
    }
  }, [transferQueueToServicePoint, servicePointQueues, servicePoints]);

  const handleReturnToWaiting = useCallback(async (queueId: string) => {
    const queue = servicePointQueues.find(q => q.id === queueId);
    const formattedNumber = queue ? formatQueueNumber(queue.type as any, queue.number) : queueId;
    
    try {
      await returnSkippedQueueToWaiting(queueId);
      toast.success(`นำคิว ${formattedNumber} กลับมารอเรียบร้อยแล้ว`);
    } catch (error) {
      toast.error(`ไม่สามารถนำคิว ${formattedNumber} กลับมารอได้`);
    }
  }, [returnSkippedQueueToWaiting, servicePointQueues]);

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
