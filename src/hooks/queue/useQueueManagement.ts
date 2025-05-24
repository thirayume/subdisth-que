
import { useState, useEffect } from 'react';
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
  
  // Get mappings for all service points, not just the selected one
  const { mappings } = useServicePointQueueTypes();
  
  const [waitingQueues, setWaitingQueues] = useState<Queue[]>([]);
  const [activeQueues, setActiveQueues] = useState<Queue[]>([]);
  const [completedQueues, setCompletedQueues] = useState<Queue[]>([]);
  const [skippedQueues, setSkippedQueues] = useState<Queue[]>([]);
  const [servicePointCapabilities, setServicePointCapabilities] = useState<ServicePointCapability[]>([]);
  
  // Extract service point capabilities for queue algorithm
  useEffect(() => {
    logger.debug('Processing mappings for service point capabilities:', mappings);
    
    if (mappings.length > 0) {
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
      setServicePointCapabilities(capabilitiesArray);
    } else {
      logger.debug('No mappings found, clearing capabilities');
      setServicePointCapabilities([]);
    }
  }, [mappings]);

  // Update filtered queues when the main queues array changes
  useEffect(() => {
    if (queues) {
      const waiting = queues.filter(q => q.status === 'WAITING');
      const active = queues.filter(q => q.status === 'ACTIVE');
      const completed = queues.filter(q => q.status === 'COMPLETED');
      const skipped = queues.filter(q => q.status === 'SKIPPED');
      
      logger.debug('Queue filtering for service point:', selectedServicePoint?.id, {
        totalWaiting: waiting.length,
        totalActive: active.length,
        servicePointCapabilities
      });
      
      // Apply sorting algorithm to waiting queues based on service point selection
      if (sortQueues) {
        const sortedQueues = sortQueues(waiting, servicePointCapabilities, selectedServicePoint?.id);
        logger.debug('Sorted waiting queues for service point:', selectedServicePoint?.id, {
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
    }
  }, [queues, sortQueues, servicePointCapabilities, selectedServicePoint]);
  
  // Handler for recalling queue
  const handleRecallQueue = (queueId: string) => {
    recallQueue(queueId);
    
    // Find the queue for the toast notification
    const queue = queues.find(q => q.id === queueId);
    if (queue) {
      // Find the patient for this queue
      const patient = patients.find(p => p.id === queue.patient_id);
      if (patient) {
        toast.info(`เรียกซ้ำคิวหมายเลข ${queue.number} - ${patient.name}`);
      } else {
        toast.info(`เรียกซ้ำคิวหมายเลข ${queue.number}`);
      }
    }
  };
  
  // Handler for calling queue with service point ID
  const handleCallQueue = async (queueId: string) => {
    if (!selectedServicePoint) {
      toast.warning('กรุณาเลือกจุดบริการก่อนเรียกคิว');
      return null;
    }
    
    // Add service point ID to the queue call
    return await callQueue(queueId, selectedServicePoint.id);
  };
  
  // Handler for transferring queue
  const handleTransferQueue = async (
    queueId: string, 
    sourceServicePointId: string,
    targetServicePointId: string,
    notes?: string,
    newQueueType?: string
  ) => {
    return await transferQueueToServicePoint(
      queueId, 
      sourceServicePointId,
      targetServicePointId,
      notes,
      newQueueType
    );
  };
  
  // Handler for holding queue
  const handleHoldQueue = async (queueId: string, servicePointId: string, reason?: string) => {
    return await putQueueOnHold(queueId, servicePointId, reason);
  };
  
  // Handler for returning skipped queue to waiting
  const handleReturnToWaiting = async (queueId: string) => {
    return await returnSkippedQueueToWaiting(queueId);
  };
  
  // Handler for service point change
  const handleServicePointChange = (value: string) => {
    const servicePoint = servicePoints.find(sp => sp.id === value);
    if (servicePoint) {
      logger.debug('Service point changed to:', servicePoint);
      setSelectedServicePoint(servicePoint);
    }
  };

  return {
    // State
    waitingQueues,
    activeQueues,
    completedQueues,
    skippedQueues,
    patients,
    queueTypes,
    selectedServicePoint,
    servicePoints,
    
    // Handlers
    handleRecallQueue,
    handleCallQueue,
    handleTransferQueue,
    handleHoldQueue,
    handleReturnToWaiting,
    handleServicePointChange,
    updateQueueStatus
  };
};
