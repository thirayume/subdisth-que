
import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { Queue, QueueStatus } from '@/integrations/supabase/schema';
import { useQueues } from '@/hooks/useQueues';
import { usePatients } from '@/hooks/usePatients';
import { useServicePointContext } from '@/contexts/ServicePointContext';
import { useServicePointQueueTypes } from '@/hooks/useServicePointQueueTypes';
import { useQueueTypes } from '@/hooks/useQueueTypes';
import { ServicePointCapability } from '@/utils/queueAlgorithms';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useQueueManagement');

export const useQueueManagement = () => {
  const { 
    queues, 
    updateQueueStatus, 
    callQueue, 
    recallQueue, 
    sortQueues,
    transferQueueToServicePoint,
    putQueueOnHold,
    returnSkippedQueueToWaiting
  } = useQueues();
  
  const { patients } = usePatients();
  const { queueTypes } = useQueueTypes();
  const { 
    selectedServicePoint,
    setSelectedServicePoint,
    servicePoints
  } = useServicePointContext();
  
  // Get mappings for all service points
  const { mappings } = useServicePointQueueTypes();
  
  // Show ALL queues regardless of service point selection
  const [waitingQueues, setWaitingQueues] = useState<Queue[]>([]);
  const [activeQueues, setActiveQueues] = useState<Queue[]>([]);
  const [completedQueues, setCompletedQueues] = useState<Queue[]>([]);
  const [skippedQueues, setSkippedQueues] = useState<Queue[]>([]);
  
  // Memoize service point capabilities to prevent unnecessary recalculations
  const servicePointCapabilities = useMemo<ServicePointCapability[]>(() => {
    logger.debug('Processing mappings for service point capabilities:', mappings);
    
    if (mappings.length === 0) {
      logger.debug('No mappings found, returning empty capabilities');
      return [];
    }

    // Group mappings by service point ID
    const capabilities: Record<string, string[]> = {};
    
    mappings.forEach(mapping => {
      if (!capabilities[mapping.service_point_id]) {
        capabilities[mapping.service_point_id] = [];
      }
      capabilities[mapping.service_point_id].push(mapping.queue_type_id);
    });
    
    // Convert to array format
    const capabilitiesArray = Object.entries(capabilities).map(([servicePointId, queueTypeIds]) => ({
      servicePointId,
      queueTypeIds
    }));
    
    logger.debug('Service point capabilities processed:', capabilitiesArray);
    return capabilitiesArray;
  }, [mappings]);

  // Memoize the intelligent service point suggestion function
  const getIntelligentServicePointSuggestion = useCallback((queue: Queue) => {
    // If queue already has a service point, return it
    if (queue.service_point_id) {
      return servicePoints.find(sp => sp.id === queue.service_point_id);
    }

    // Find queue type for this queue
    const queueType = queueTypes.find(qt => qt.code === queue.type);
    if (!queueType) return null;

    // Find service points that can handle this queue type
    const compatibleServicePoints = servicePointCapabilities
      .filter(cap => cap.queueTypeIds.includes(queueType.id))
      .map(cap => servicePoints.find(sp => sp.id === cap.servicePointId))
      .filter(Boolean);

    // Return the first compatible service point, or null if none found
    return compatibleServicePoints[0] || null;
  }, [servicePoints, queueTypes, servicePointCapabilities]);

  // Update filtered queues to show ALL queues (no service point filtering)
  useEffect(() => {
    logger.debug('useEffect for queue filtering triggered');
    
    if (!queues) {
      logger.debug('No queues available, skipping update');
      return;
    }

    const waiting = queues.filter(q => q.status === 'WAITING');
    const active = queues.filter(q => q.status === 'ACTIVE');
    const completed = queues.filter(q => q.status === 'COMPLETED');
    const skipped = queues.filter(q => q.status === 'SKIPPED');
    
    logger.debug('Showing all queues (no service point filtering):', {
      totalWaiting: waiting.length,
      totalActive: active.length,
      totalCompleted: completed.length,
      totalSkipped: skipped.length
    });
    
    // Apply sorting algorithm to waiting queues (but show all)
    if (sortQueues) {
      const sortedQueues = sortQueues(waiting, servicePointCapabilities);
      logger.debug('Sorted all waiting queues:', {
        originalCount: waiting.length,
        sortedCount: sortedQueues.length
      });
      setWaitingQueues(sortedQueues);
    } else {
      setWaitingQueues(waiting);
    }
    
    setActiveQueues(active);
    setCompletedQueues(completed);
    setSkippedQueues(skipped);
  }, [queues, sortQueues, servicePointCapabilities]); // Stable dependencies now
  
  // Handler for recalling queue
  const handleRecallQueue = useCallback((queueId: string) => {
    recallQueue(queueId);
    
    // Find the queue for the toast notification
    const queue = queues?.find(q => q.id === queueId);
    if (queue) {
      // Find the patient for this queue
      const patient = patients.find(p => p.id === queue.patient_id);
      if (patient) {
        toast.info(`เรียกซ้ำคิวหมายเลข ${queue.number} - ${patient.name}`);
      } else {
        toast.info(`เรียกซ้ำคิวหมายเลข ${queue.number}`);
      }
    }
  }, [recallQueue, queues, patients]);
  
  // Enhanced handler for calling queue with intelligent service point suggestion
  const handleCallQueue = useCallback(async (queueId: string, manualServicePointId?: string) => {
    const queue = queues?.find(q => q.id === queueId);
    if (!queue) {
      toast.error('ไม่พบคิวที่ต้องการเรียก');
      return null;
    }

    // Use manual service point if provided, otherwise get intelligent suggestion
    let targetServicePointId = manualServicePointId;
    
    if (!targetServicePointId) {
      const suggestedServicePoint = getIntelligentServicePointSuggestion(queue);
      if (!suggestedServicePoint) {
        toast.warning('ไม่พบจุดบริการที่เหมาะสมสำหรับคิวนี้ กรุณาเลือกจุดบริการด้วยตนเอง');
        return null;
      }
      targetServicePointId = suggestedServicePoint.id;
    }
    
    // Call queue with the determined service point
    const result = await callQueue(queueId, targetServicePointId);
    
    if (result) {
      const servicePoint = servicePoints.find(sp => sp.id === targetServicePointId);
      toast.success(`เรียกคิวหมายเลข ${queue.number} ไปยัง${servicePoint?.name || 'จุดบริการ'}`);
    }
    
    return result;
  }, [queues, servicePoints, getIntelligentServicePointSuggestion, callQueue]);
  
  // Handler for transferring queue with recalculation
  const handleTransferQueue = useCallback(async (
    queueId: string, 
    sourceServicePointId: string,
    targetServicePointId: string,
    notes?: string,
    newQueueType?: string
  ) => {
    const result = await transferQueueToServicePoint(
      queueId, 
      sourceServicePointId,
      targetServicePointId,
      notes,
      newQueueType
    );
    
    if (result) {
      // Trigger recalculation of queue assignments for affected service points
      logger.info('Queue transfer completed, triggering algorithm recalculation');
      toast.success('โอนคิวเรียบร้อยแล้ว และปรับปรุงลำดับคิวอัตโนมัติ');
    }
    
    return result;
  }, [transferQueueToServicePoint]);
  
  // Handler for holding queue
  const handleHoldQueue = useCallback(async (queueId: string, servicePointId: string, reason?: string) => {
    return await putQueueOnHold(queueId, servicePointId, reason);
  }, [putQueueOnHold]);
  
  // Handler for returning skipped queue to waiting
  const handleReturnToWaiting = useCallback(async (queueId: string) => {
    return await returnSkippedQueueToWaiting(queueId);
  }, [returnSkippedQueueToWaiting]);
  
  // Handler for service point change (for manual assignment)
  const handleServicePointChange = useCallback((value: string) => {
    const servicePoint = servicePoints.find(sp => sp.id === value);
    if (servicePoint) {
      logger.debug('Service point changed to:', servicePoint);
      setSelectedServicePoint(servicePoint);
    }
  }, [servicePoints, setSelectedServicePoint]);

  return {
    // State - now showing ALL queues
    waitingQueues,
    activeQueues,
    completedQueues,
    skippedQueues,
    patients,
    queueTypes,
    selectedServicePoint,
    servicePoints,
    servicePointCapabilities,
    
    // Handlers
    handleRecallQueue,
    handleCallQueue,
    handleTransferQueue,
    handleHoldQueue,
    handleReturnToWaiting,
    handleServicePointChange,
    updateQueueStatus,
    
    // New utility functions
    getIntelligentServicePointSuggestion
  };
};
