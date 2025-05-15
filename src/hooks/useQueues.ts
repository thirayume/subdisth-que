
import * as React from 'react';
import { Queue, QueueStatus, QueueType } from '@/integrations/supabase/schema';
import { useQueueState } from './queue/useQueueState';
import { useQueueStatusUpdates } from './queue/useQueueStatusUpdates';
import { useQueueAnnouncements } from './queue/useQueueAnnouncements';
import { announceQueue } from '@/utils/textToSpeech';
import { QueueAlgorithmType, sortQueuesByAlgorithm, QueueTypeWithAlgorithm, ServicePointCapability } from '@/utils/queueAlgorithms';
import { createLogger } from '@/utils/logger';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const logger = createLogger('useQueues');

export const useQueues = () => {
  logger.debug('Hook initialized');
  
  const { 
    queues, 
    loading, 
    error, 
    fetchQueues, 
    addQueue, 
    getQueuesByStatus,
    updateQueueInState
  } = useQueueState();
  
  const { updateQueueStatus } = useQueueStatusUpdates(updateQueueInState);
  
  const { 
    voiceEnabled, 
    setVoiceEnabled, 
    counterName, 
    setCounterName, 
    updateQueueSettings, 
    recallQueue: baseRecallQueue 
  } = useQueueAnnouncements();
  
  // Load algorithm and queue types from localStorage
  const [queueAlgorithm, setQueueAlgorithm] = React.useState<QueueAlgorithmType>(QueueAlgorithmType.FIFO);
  const [queueTypes, setQueueTypes] = React.useState<QueueTypeWithAlgorithm[]>([]);
  
  React.useEffect(() => {
    logger.info('Loading queue algorithm and types');
    // Load algorithm from localStorage
    const savedAlgorithm = localStorage.getItem('queue_algorithm') as QueueAlgorithmType | null;
    if (savedAlgorithm) {
      setQueueAlgorithm(savedAlgorithm);
    }
    
    // Load queue types from localStorage
    const savedQueueTypes = localStorage.getItem('queue_types');
    if (savedQueueTypes) {
      try {
        const parsedQueueTypes = JSON.parse(savedQueueTypes);
        setQueueTypes(parsedQueueTypes);
      } catch (error) {
        logger.error('Error parsing queue types from localStorage:', error);
      }
    }
  }, []);
  
  // Sort queues by the selected algorithm
  const sortQueues = (
    queuesToSort: Queue[],
    servicePointCapabilities: ServicePointCapability[] = [],
    selectedServicePointId?: string
  ) => {
    return sortQueuesByAlgorithm(
      queuesToSort, 
      queueTypes, 
      queueAlgorithm, 
      servicePointCapabilities,
      selectedServicePointId
    );
  };
  
  // Wrapper for callQueue to handle both status update and announcement
  const callQueue = async (queueId: string, servicePointId?: string) => {
    const queueToCall = queues.find(q => q.id === queueId);
    if (queueToCall) {
      try {
        // If a service point ID is provided, update the queue with it
        let updatedQueue: Queue | null;
        
        if (servicePointId) {
          const { data, error } = await supabase
            .from('queues')
            .update({
              status: 'ACTIVE',
              called_at: new Date().toISOString(),
              service_point_id: servicePointId
            })
            .eq('id', queueId)
            .select();
            
          if (error) throw error;
          if (!data || data.length === 0) throw new Error('No queue returned from update');
          
          updatedQueue = {
            ...data[0],
            type: data[0].type as QueueType,
            status: data[0].status as QueueStatus
          };
          
          // Update the queue in state
          updateQueueInState(updatedQueue);
        } else {
          // Fall back to the original update method if no service point ID
          updatedQueue = await updateQueueStatus(queueId, 'ACTIVE');
        }
        
        if (updatedQueue && voiceEnabled) {
          try {
            // Get service point info if available
            let servicePointName = counterName;
            
            if (servicePointId) {
              const { data: servicePointData } = await supabase
                .from('service_points')
                .select('name')
                .eq('id', servicePointId)
                .single();
                
              if (servicePointData) {
                servicePointName = servicePointData.name;
              }
            }
            
            const announcementText = localStorage.getItem('queue_announcement_text') || 
              'ขอเชิญหมายเลข {queueNumber} ที่ช่องบริการ {counter}';
            
            await announceQueue(
              updatedQueue.number, 
              servicePointName, 
              updatedQueue.type,
              announcementText
            );
          } catch (err) {
            logger.error('Error announcing queue:', err);
          }
        }
        return updatedQueue;
      } catch (err) {
        toast.error('ไม่สามารถเรียกคิวได้');
        logger.error('Error calling queue:', err);
        return null;
      }
    }
    return null;
  };

  // Wrapper for recallQueue that gets queue by ID first
  const recallQueue = (queueId: string) => {
    const getQueueById = (id: string) => queues.find(q => q.id === id);
    return baseRecallQueue(queueId, getQueueById);
  };
  
  // Get next queue to call based on the selected algorithm
  const getNextQueueToCall = (
    servicePointCapabilities: ServicePointCapability[] = [],
    selectedServicePointId?: string
  ) => {
    const waitingQueues = queues.filter(q => q.status === 'WAITING');
    if (waitingQueues.length === 0) return null;
    
    const sortedQueues = sortQueues(waitingQueues, servicePointCapabilities, selectedServicePointId);
    return sortedQueues[0] || null;
  };

  return {
    queues,
    loading,
    error,
    fetchQueues,
    addQueue,
    updateQueueStatus,
    getQueuesByStatus,
    callQueue,
    recallQueue,
    voiceEnabled,
    setVoiceEnabled,
    counterName,
    setCounterName,
    updateQueueSettings,
    sortQueues,
    queueAlgorithm,
    setQueueAlgorithm,
    getNextQueueToCall
  };
};
