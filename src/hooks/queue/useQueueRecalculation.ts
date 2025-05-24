
import { useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQueues } from '@/hooks/useQueues';
import { useServicePointQueueTypes } from '@/hooks/useServicePointQueueTypes';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useQueueRecalculation');

export const useQueueRecalculation = () => {
  const { fetchQueues } = useQueues();
  const { mappings } = useServicePointQueueTypes();

  const recalculateAllQueues = useCallback(async () => {
    try {
      logger.info('Starting queue recalculation...');
      toast.info('กำลังคำนวณการมอบหมายคิวใหม่...');

      // Get all waiting queues
      const { data: waitingQueues, error: queueError } = await supabase
        .from('queues')
        .select('*')
        .eq('status', 'WAITING')
        .eq('queue_date', new Date().toISOString().split('T')[0]);

      if (queueError) {
        throw queueError;
      }

      if (!waitingQueues || waitingQueues.length === 0) {
        toast.info('ไม่มีคิวที่รอดำเนินการสำหรับการคำนวณใหม่');
        return;
      }

      // Get queue types
      const { data: queueTypes, error: queueTypesError } = await supabase
        .from('queue_types')
        .select('*')
        .eq('enabled', true);

      if (queueTypesError) {
        throw queueTypesError;
      }

      // Get service points
      const { data: servicePoints, error: servicePointsError } = await supabase
        .from('service_points')
        .select('*')
        .eq('enabled', true);

      if (servicePointsError) {
        throw servicePointsError;
      }

      // Process each queue for reassignment
      const updatePromises: Promise<any>[] = [];
      
      for (const queue of waitingQueues) {
        // Find queue type
        const queueType = queueTypes?.find(qt => qt.code === queue.type);
        if (!queueType) continue;

        // Find compatible service points for this queue type
        const compatibleServicePoints = mappings
          .filter(mapping => mapping.queue_type_id === queueType.id)
          .map(mapping => servicePoints?.find(sp => sp.id === mapping.service_point_id))
          .filter(Boolean);

        if (compatibleServicePoints.length > 0) {
          // Simple load balancing - assign to service point with fewer queues
          let selectedServicePoint = compatibleServicePoints[0];
          
          // Get current queue counts for each compatible service point
          for (const sp of compatibleServicePoints) {
            const { count } = await supabase
              .from('queues')
              .select('*', { count: 'exact', head: true })
              .eq('service_point_id', sp.id)
              .eq('status', 'WAITING')
              .eq('queue_date', new Date().toISOString().split('T')[0]);

            // Simple assignment logic - could be enhanced with more sophisticated algorithms
            if (!selectedServicePoint || (count !== null && count < 5)) {
              selectedServicePoint = sp;
            }
          }

          // Update queue assignment if it needs to change
          if (queue.service_point_id !== selectedServicePoint.id) {
            const updatePromise = Promise.resolve(
              supabase
                .from('queues')
                .update({ service_point_id: selectedServicePoint.id })
                .eq('id', queue.id)
            );
            
            updatePromises.push(updatePromise);
          }
        }
      }

      // Execute all updates
      if (updatePromises.length > 0) {
        await Promise.all(updatePromises);
        logger.info(`Recalculated ${updatePromises.length} queue assignments`);
        toast.success(`คำนวณการมอบหมายคิวใหม่เรียบร้อย (${updatePromises.length} คิว)`);
      } else {
        toast.info('การมอบหมายคิวทั้งหมดเหมาะสมแล้ว');
      }

      // Refresh queue data
      await fetchQueues();

    } catch (error) {
      logger.error('Error recalculating queues:', error);
      toast.error('เกิดข้อผิดพลาดในการคำนวณคิวใหม่');
    }
  }, [mappings, fetchQueues]);

  return {
    recalculateAllQueues
  };
};
