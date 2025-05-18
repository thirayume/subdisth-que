import * as React from 'react';
import { Queue, QueueStatus } from '@/integrations/supabase/schema';
import { useQueueState } from './queue/useQueueState';
import { useQueueStatusUpdates } from './queue/useQueueStatusUpdates';
import { useQueueAnnouncements } from './queue/useQueueAnnouncements';
import { announceQueue } from '@/utils/textToSpeech';
import { QueueAlgorithmType, sortQueuesByAlgorithm, QueueTypeWithAlgorithm, ServicePointCapability } from '@/utils/queueAlgorithms';
import { createLogger } from '@/utils/logger';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getNextQueue, transferQueue, holdQueue } from '@/utils/queueManagementUtils';

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
  
  // Load algorithm and queue types from localStorage and Supabase
  const [queueAlgorithm, setQueueAlgorithm] = React.useState<QueueAlgorithmType>(QueueAlgorithmType.FIFO);
  const [queueTypes, setQueueTypes] = React.useState<QueueTypeWithAlgorithm[]>([]);
  
  React.useEffect(() => {
    logger.info('Loading queue algorithm and types');
    
    // Load algorithm from settings
    const fetchQueueAlgorithm = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('value')
          .eq('category', 'queue')
          .eq('key', 'queue_algorithm')
          .single();
          
        if (error) {
          logger.error('Error fetching queue algorithm from database:', error);
          // Fall back to localStorage
          const savedAlgorithm = localStorage.getItem('queue_algorithm') as QueueAlgorithmType | null;
          if (savedAlgorithm) {
            setQueueAlgorithm(savedAlgorithm);
          }
          return;
        }
        
        if (data?.value) {
          const algorithm = data.value as QueueAlgorithmType;
          setQueueAlgorithm(algorithm);
          // Update localStorage as well
          localStorage.setItem('queue_algorithm', algorithm);
        }
      } catch (err) {
        logger.error('Error in fetchQueueAlgorithm:', err);
        // Fall back to localStorage
        const savedAlgorithm = localStorage.getItem('queue_algorithm') as QueueAlgorithmType | null;
        if (savedAlgorithm) {
          setQueueAlgorithm(savedAlgorithm);
        }
      }
    };
    
    // Load queue types from settings
    const fetchQueueTypes = async () => {
      try {
        const { data, error } = await supabase
          .from('queue_types')
          .select('*')
          .eq('enabled', true);
          
        if (error) {
          logger.error('Error fetching queue types from database:', error);
          // Fall back to localStorage
          const savedQueueTypes = localStorage.getItem('queue_types');
          if (savedQueueTypes) {
            try {
              const parsedQueueTypes = JSON.parse(savedQueueTypes);
              setQueueTypes(parsedQueueTypes);
            } catch (error) {
              logger.error('Error parsing queue types from localStorage:', error);
            }
          }
          return;
        }
        
        if (data && data.length > 0) {
          setQueueTypes(data as QueueTypeWithAlgorithm[]);
          // Update localStorage as well
          localStorage.setItem('queue_types', JSON.stringify(data));
        }
      } catch (err) {
        logger.error('Error in fetchQueueTypes:', err);
        // Fall back to localStorage
        const savedQueueTypes = localStorage.getItem('queue_types');
        if (savedQueueTypes) {
          try {
            const parsedQueueTypes = JSON.parse(savedQueueTypes);
            setQueueTypes(parsedQueueTypes);
          } catch (error) {
            logger.error('Error parsing queue types from localStorage:', error);
          }
        }
      }
    };
    
    fetchQueueAlgorithm();
    fetchQueueTypes();
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
            type: data[0].type as Queue['type'],
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
  
  // Get next queue to call based on the selected algorithm and service point
  const getNextQueueToCall = async (servicePointId?: string) => {
    try {
      // First try the utility function that uses database-level sorting
      const nextQueue = await getNextQueue(servicePointId || null, queueAlgorithm);
      
      // If we have a result from the database, use it
      if (nextQueue) return nextQueue;
      
      // Fall back to client-side sorting if needed
      const waitingQueues = queues.filter(q => q.status === 'WAITING');
      if (waitingQueues.length === 0) return null;
      
      // Get service point capabilities if we have a service point ID
      let servicePointCapabilities: ServicePointCapability[] = [];
      
      if (servicePointId) {
        const { data, error } = await supabase
          .from('service_point_queue_types')
          .select(`
            queue_type_id,
            queue_type:queue_types(id, code)
          `)
          .eq('service_point_id', servicePointId);
          
        if (!error && data) {
          // Transform the data to match the ServicePointCapability type
          const capabilities: ServicePointCapability[] = [];
          
          // Group queue type IDs by service point
          const queueTypeIds = data.map(item => item.queue_type_id);
          
          if (queueTypeIds.length > 0) {
            capabilities.push({
              servicePointId,
              queueTypeIds
            });
          }
          
          servicePointCapabilities = capabilities;
        }
      }
      
      const sortedQueues = sortQueues(waitingQueues, servicePointCapabilities, servicePointId);
      return sortedQueues[0] || null;
      
    } catch (error) {
      logger.error('Error in getNextQueueToCall:', error);
      return null;
    }
  };

  // Transfer a queue to another service point
  const transferQueueToServicePoint = async (
    queueId: string, 
    sourceServicePointId: string,
    targetServicePointId: string,
    notes?: string
  ) => {
    const result = await transferQueue(
      queueId, 
      sourceServicePointId,
      targetServicePointId,
      notes
    );
    
    if (result) {
      toast.success('โอนคิวไปยังจุดบริการอื่นเรียบร้อยแล้ว');
      fetchQueues(); // Refresh queues after transfer
      return true;
    } else {
      toast.error('ไม่สามารถโอนคิวไปยังจุดบริการอื่นได้');
      return false;
    }
  };
  
  // Hold a queue
  const putQueueOnHold = async (
    queueId: string, 
    servicePointId: string,
    reason?: string
  ) => {
    const result = await holdQueue(queueId, servicePointId, reason);
    
    if (result) {
      toast.success('พักคิวเรียบร้อยแล้ว');
      fetchQueues(); // Refresh queues after hold
      return true;
    } else {
      toast.error('ไม่สามารถพักคิวได้');
      return false;
    }
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
    getNextQueueToCall,
    transferQueueToServicePoint,
    putQueueOnHold
  };
};
