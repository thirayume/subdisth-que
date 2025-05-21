import * as React from 'react';
import { Queue } from '@/integrations/supabase/schema';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { createLogger } from '@/utils/logger';
import { getNextQueue, transferQueue, holdQueue } from '@/utils/queueManagementUtils';
import { QueueAlgorithmType, ServicePointCapability } from '@/utils/queueAlgorithms';

const logger = createLogger('useQueueActions');

export const useQueueActions = (
  queues: Queue[],
  updateQueueStatus: (queueId: string, newStatus: Queue['status']) => Promise<Queue | null>,
  updateQueueInState: (updatedQueue: Queue) => void,
  fetchQueues: () => Promise<void>,
  sortQueues: (queues: Queue[], capabilities?: ServicePointCapability[], servicePointId?: string) => Queue[],
  queueAlgorithm: QueueAlgorithmType,
  announceQueue: (queueId: string, getQueueById: (id: string) => Queue | undefined) => Promise<boolean>,
  voiceEnabled: boolean
) => {
  // Call a queue and update its status
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
          
          updatedQueue = data[0] as Queue;
          
          // Update the queue in state
          updateQueueInState(updatedQueue);
        } else {
          // Fall back to the original update method if no service point ID
          updatedQueue = await updateQueueStatus(queueId, 'ACTIVE');
        }
        
        if (updatedQueue && voiceEnabled) {
          // Get queue by ID function for announcement
          const getQueueById = (id: string) => queues.find(q => q.id === id);
          await announceQueue(queueId, getQueueById);
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
          // Group queue type IDs by service point
          const queueTypeIds = data.map(item => item.queue_type_id);
          
          if (queueTypeIds.length > 0) {
            servicePointCapabilities.push({
              servicePointId,
              queueTypeIds
            });
          }
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
    callQueue,
    getNextQueueToCall,
    transferQueueToServicePoint,
    putQueueOnHold
  };
};
