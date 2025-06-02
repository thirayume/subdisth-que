
import { useCallback } from 'react';
import { toast } from 'sonner';
import { Queue, QueueStatus } from '@/integrations/supabase/schema';
import { supabase } from '@/integrations/supabase/client';
import { announceQueue } from '@/utils/textToSpeech';
import { getServicePointById } from '@/utils/servicePointUtils';
import { QueueAlgorithmType, ServicePointCapability } from '@/utils/queueAlgorithms';
import { createLogger } from '@/utils/logger';
import { mapToQueueObject } from '@/utils/queue/queueMapping';

const logger = createLogger('useQueueActions');

export const useQueueActions = (
  queues: Queue[],
  updateQueueStatus: (queueId: string, status: QueueStatus) => Promise<Queue | null>,
  updateQueueInState: (queue: Queue) => void,
  fetchQueues: () => Promise<void>,
  sortQueues: (queues: Queue[], servicePointCapabilities: ServicePointCapability[], selectedServicePointId?: string) => Queue[],
  queueAlgorithm: QueueAlgorithmType,
  recallQueue: (queueId: string, getQueueById: (id: string) => Queue | undefined) => void,
  voiceEnabled: boolean
) => {
  // Get intelligent service point suggestion for a queue
  const getIntelligentServicePointSuggestion = useCallback(async (queueTypeCode: string) => {
    try {
      // Get service points that can handle this queue type
      const { data: servicePointQueueTypes, error } = await supabase
        .from('service_point_queue_types')
        .select(`
          service_point_id,
          service_point:service_points!inner(*)
        `)
        .eq('service_point.enabled', true);

      if (error) {
        logger.error('Error fetching service point mappings:', error);
        return null;
      }

      // Get queue type ID
      const { data: queueTypes, error: queueTypeError } = await supabase
        .from('queue_types')
        .select('id')
        .eq('code', queueTypeCode)
        .single();

      if (queueTypeError || !queueTypes) {
        logger.error('Error fetching queue type:', queueTypeError);
        return null;
      }

      // Find service points that can handle this queue type
      const compatibleServicePoints = servicePointQueueTypes?.filter(spqt => 
        spqt.service_point_id === queueTypes.id
      );

      if (compatibleServicePoints && compatibleServicePoints.length > 0) {
        // Return the first compatible service point
        return compatibleServicePoints[0].service_point;
      }

      return null;
    } catch (error) {
      logger.error('Error in getIntelligentServicePointSuggestion:', error);
      return null;
    }
  }, []);

  // Call next queue for a specific service point
  const callQueue = useCallback(async (queueId: string, servicePointId?: string): Promise<Queue | null> => {
    try {
      const queue = queues.find(q => q.id === queueId);
      if (!queue) {
        toast.error('ไม่พบคิวที่ต้องการเรียก');
        return null;
      }

      let targetServicePointId = servicePointId;

      // If no service point specified, try to get intelligent suggestion
      if (!targetServicePointId && !queue.service_point_id) {
        const suggestedServicePoint = await getIntelligentServicePointSuggestion(queue.type);
        if (suggestedServicePoint) {
          targetServicePointId = suggestedServicePoint.id;
        }
      } else if (queue.service_point_id) {
        targetServicePointId = queue.service_point_id;
      }

      const updateData: any = {
        status: 'ACTIVE',
        called_at: new Date().toISOString()
      };

      // Add service point assignment if we have one
      if (targetServicePointId) {
        updateData.service_point_id = targetServicePointId;
      }

      const { data, error } = await supabase
        .from('queues')
        .update(updateData)
        .eq('id', queueId)
        .select()
        .single();

      if (error) {
        logger.error('Error calling queue:', error);
        toast.error('ไม่สามารถเรียกคิวได้');
        return null;
      }

      if (data) {
        // Convert raw data to properly typed Queue object
        const typedQueue = mapToQueueObject(data);
        updateQueueInState(typedQueue);
        
        // Announce queue if voice is enabled
        if (voiceEnabled) {
          // Get service point information for announcement
          const servicePointInfo = targetServicePointId 
            ? await getServicePointById(targetServicePointId)
            : null;
          
          await announceQueue(
            queue.number, 
            servicePointInfo || { code: '', name: 'ช่องบริการ หนึ่ง' }, 
            queue.type
          );
        }
        
        toast.success(`เรียกคิวหมายเลข ${queue.number} เรียบร้อยแล้ว`);
        return typedQueue;
      }

      return null;
    } catch (error) {
      logger.error('Error in callQueue:', error);
      toast.error('เกิดข้อผิดพลาดในการเรียกคิว');
      return null;
    }
  }, [queues, updateQueueInState, voiceEnabled, getIntelligentServicePointSuggestion]);

  // Get next queue to call for a specific service point
  const getNextQueueToCall = useCallback(async (servicePointId: string) => {
    try {
      // Get waiting queues for this service point
      const waitingQueues = queues.filter(q => 
        q.status === 'WAITING' && 
        (q.service_point_id === servicePointId || !q.service_point_id)
      );

      if (waitingQueues.length === 0) {
        return null;
      }

      // Use the sorting algorithm to get the next queue
      const sortedQueues = sortQueues(waitingQueues, [], servicePointId);
      return sortedQueues[0] || null;
    } catch (error) {
      logger.error('Error getting next queue:', error);
      return null;
    }
  }, [queues, sortQueues]);

  // Transfer queue to another service point
  const transferQueueToServicePoint = useCallback(async (
    queueId: string,
    sourceServicePointId: string,
    targetServicePointId: string,
    notes?: string,
    newQueueType?: string
  ): Promise<Queue | null> => {
    try {
      const updateData: any = {
        service_point_id: targetServicePointId,
        transferred_to_service_point_id: sourceServicePointId,
        transferred_at: new Date().toISOString()
      };

      if (notes) {
        updateData.notes = notes;
      }

      if (newQueueType) {
        updateData.type = newQueueType;
      }

      const { data, error } = await supabase
        .from('queues')
        .update(updateData)
        .eq('id', queueId)
        .select()
        .single();

      if (error) {
        logger.error('Error transferring queue:', error);
        toast.error('ไม่สามารถโอนคิวได้');
        return null;
      }

      if (data) {
        // Convert raw data to properly typed Queue object
        const typedQueue = mapToQueueObject(data);
        updateQueueInState(typedQueue);
        toast.success('โอนคิวเรียบร้อยแล้ว');
        return typedQueue;
      }

      return null;
    } catch (error) {
      logger.error('Error in transferQueueToServicePoint:', error);
      toast.error('เกิดข้อผิดพลาดในการโอนคิว');
      return null;
    }
  }, [updateQueueInState]);

  // Put queue on hold
  const putQueueOnHold = useCallback(async (queueId: string, servicePointId: string, reason?: string): Promise<Queue | null> => {
    try {
      const updateData: any = {
        status: 'WAITING',
        paused_at: new Date().toISOString()
      };

      if (reason) {
        updateData.notes = reason;
      }

      const { data, error } = await supabase
        .from('queues')
        .update(updateData)
        .eq('id', queueId)
        .select()
        .single();

      if (error) {
        logger.error('Error putting queue on hold:', error);
        toast.error('ไม่สามารถพักคิวได้');
        return null;
      }

      if (data) {
        // Convert raw data to properly typed Queue object
        const typedQueue = mapToQueueObject(data);
        updateQueueInState(typedQueue);
        toast.success('พักคิวเรียบร้อยแล้ว');
        return typedQueue;
      }

      return null;
    } catch (error) {
      logger.error('Error in putQueueOnHold:', error);
      toast.error('เกิดข้อผิดพลาดในการพักคิว');
      return null;
    }
  }, [updateQueueInState]);

  // Return skipped queue to waiting
  const returnSkippedQueueToWaiting = useCallback(async (queueId: string): Promise<Queue | null> => {
    try {
      const { data, error } = await supabase
        .from('queues')
        .update({
          status: 'WAITING',
          skipped_at: null
        })
        .eq('id', queueId)
        .select()
        .single();

      if (error) {
        logger.error('Error returning skipped queue to waiting:', error);
        toast.error('ไม่สามารถนำคิวกลับมารอได้');
        return null;
      }

      if (data) {
        // Convert raw data to properly typed Queue object
        const typedQueue = mapToQueueObject(data);
        updateQueueInState(typedQueue);
        toast.success('นำคิวกลับมารอเรียบร้อยแล้ว');
        return typedQueue;
      }

      return null;
    } catch (error) {
      logger.error('Error in returnSkippedQueueToWaiting:', error);
      toast.error('เกิดข้อผิดพลาดในการนำคิวกลับมารอ');
      return null;
    }
  }, [updateQueueInState]);

  return {
    callQueue,
    getNextQueueToCall,
    transferQueueToServicePoint,
    putQueueOnHold,
    returnSkippedQueueToWaiting,
    getIntelligentServicePointSuggestion
  };
};
