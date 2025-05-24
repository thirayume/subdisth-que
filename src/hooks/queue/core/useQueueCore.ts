
import * as React from 'react';
import { Queue } from '@/integrations/supabase/schema';
import { supabase } from '@/integrations/supabase/client';
import { useOptimizedQueueState } from '../useOptimizedQueueState';
import { useQueueStatusUpdates } from '../useQueueStatusUpdates';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useQueueCore');

export const useQueueCore = () => {
  logger.debug('Hook initialized');
  
  // Use the optimized state hook
  const { 
    queues, 
    loading, 
    error, 
    fetchQueues, 
    getQueuesByStatus,
    updateQueueInState
  } = useOptimizedQueueState();
  
  const { updateQueueStatus } = useQueueStatusUpdates(updateQueueInState);

  // Optimized addQueue function with immediate state update
  const addQueue = React.useCallback(async (queueData: Partial<Queue>) => {
    try {
      if (!queueData.patient_id || !queueData.number || !queueData.type) {
        throw new Error('Missing required queue data');
      }
      
      logger.info('Adding queue:', queueData);
      
      // Optimistically add to state first
      const tempQueue: Queue = {
        id: `temp-${Date.now()}`,
        patient_id: queueData.patient_id,
        number: queueData.number,
        type: queueData.type as any,
        status: (queueData.status || 'WAITING') as any,
        notes: queueData.notes || null,
        queue_date: new Date().toISOString().slice(0, 10),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        called_at: null,
        completed_at: null,
        service_point_id: null
      };
      
      updateQueueInState(tempQueue);

      // Then save to database
      const { data, error } = await supabase
        .from('queues')
        .insert([{
          patient_id: queueData.patient_id,
          number: queueData.number,
          type: queueData.type,
          status: queueData.status || 'WAITING',
          notes: queueData.notes
        }])
        .select();

      if (error) {
        // Remove temp queue on error by filtering it out
        const updatedQueues = queues.filter(q => q.id !== tempQueue.id);
        updatedQueues.forEach(q => updateQueueInState(q));
        throw error;
      }

      if (!data || data.length === 0) {
        // Remove temp queue on error by filtering it out
        const updatedQueues = queues.filter(q => q.id !== tempQueue.id);
        updatedQueues.forEach(q => updateQueueInState(q));
        throw new Error('No queue data returned from insert');
      }
      
      const newQueue: Queue = {
        ...data[0],
        type: data[0].type as any,
        status: data[0].status as any
      };
      
      // Replace temp queue with real queue
      updateQueueInState(newQueue);
      
      logger.info('Queue added successfully:', newQueue);
      return newQueue;
    } catch (err: unknown) {
      logger.error('Error adding queue:', err);
      return null;
    }
  }, [updateQueueInState, queues]);

  return {
    queues,
    loading,
    error,
    fetchQueues,
    addQueue,
    updateQueueStatus,
    getQueuesByStatus,
    updateQueueInState
  };
};
