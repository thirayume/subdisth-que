
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

      const today = new Date().toISOString().split('T')[0];

      // Get all waiting queues for today
      const { data: waitingQueues, error: queueError } = await supabase
        .from('queues')
        .select('*')
        .eq('status', 'WAITING')
        .eq('queue_date', today);

      if (queueError) {
        logger.error('Error fetching waiting queues:', queueError);
        throw new Error(`Database error: ${queueError.message}`);
      }

      if (!waitingQueues || waitingQueues.length === 0) {
        logger.info('No waiting queues found for recalculation');
        toast.info('ไม่มีคิวที่รอดำเนินการสำหรับการคำนวณใหม่');
        return;
      }

      logger.info(`Found ${waitingQueues.length} waiting queues to process`);

      // Get queue types
      const { data: queueTypes, error: queueTypesError } = await supabase
        .from('queue_types')
        .select('*')
        .eq('enabled', true);

      if (queueTypesError) {
        logger.error('Error fetching queue types:', queueTypesError);
        throw new Error(`Database error: ${queueTypesError.message}`);
      }

      // Get service points
      const { data: servicePoints, error: servicePointsError } = await supabase
        .from('service_points')
        .select('*')
        .eq('enabled', true);

      if (servicePointsError) {
        logger.error('Error fetching service points:', servicePointsError);
        throw new Error(`Database error: ${servicePointsError.message}`);
      }

      if (!servicePoints || servicePoints.length === 0) {
        logger.warn('No enabled service points found');
        toast.warning('ไม่พบจุดบริการที่เปิดใช้งาน');
        return;
      }

      // Process each queue for reassignment
      const updatePromises: Promise<any>[] = [];
      let reassignedCount = 0;
      
      for (const queue of waitingQueues) {
        try {
          // Find queue type
          const queueType = queueTypes?.find(qt => qt.code === queue.type);
          if (!queueType) {
            logger.warn(`Queue type not found for queue ${queue.id}: ${queue.type}`);
            continue;
          }

          // Find compatible service points for this queue type
          const compatibleServicePoints = mappings
            .filter(mapping => mapping.queue_type_id === queueType.id)
            .map(mapping => servicePoints?.find(sp => sp.id === mapping.service_point_id))
            .filter(Boolean);

          if (compatibleServicePoints.length === 0) {
            logger.warn(`No compatible service points found for queue type: ${queueType.code}`);
            continue;
          }

          // Simple load balancing - assign to service point with fewer queues
          let selectedServicePoint = compatibleServicePoints[0];
          let minQueueCount = Number.MAX_SAFE_INTEGER;
          
          // Get current queue counts for each compatible service point
          for (const sp of compatibleServicePoints) {
            try {
              const { count } = await supabase
                .from('queues')
                .select('*', { count: 'exact', head: true })
                .eq('service_point_id', sp.id)
                .eq('status', 'WAITING')
                .eq('queue_date', today);

              const queueCount = count || 0;
              if (queueCount < minQueueCount) {
                minQueueCount = queueCount;
                selectedServicePoint = sp;
              }
            } catch (error) {
              logger.warn(`Error getting queue count for service point ${sp.id}:`, error);
            }
          }

          // Update queue assignment if it needs to change
          if (queue.service_point_id !== selectedServicePoint.id) {
            // Fix: Execute the Supabase query properly to return a Promise
            const updatePromise = supabase
              .from('queues')
              .update({ service_point_id: selectedServicePoint.id })
              .eq('id', queue.id)
              .then(result => result); // Convert to proper Promise
            
            updatePromises.push(updatePromise);
            reassignedCount++;
            
            logger.debug(`Reassigning queue ${queue.id} to service point ${selectedServicePoint.id}`);
          }
        } catch (error) {
          logger.warn(`Error processing queue ${queue.id}:`, error);
        }
      }

      // Execute all updates
      if (updatePromises.length > 0) {
        const results = await Promise.allSettled(updatePromises);
        
        // Check for any failed updates
        const failedUpdates = results.filter(result => result.status === 'rejected');
        if (failedUpdates.length > 0) {
          logger.warn(`${failedUpdates.length} queue updates failed`);
          failedUpdates.forEach((result, index) => {
            if (result.status === 'rejected') {
              logger.error(`Update ${index} failed:`, result.reason);
            }
          });
        }

        const successfulUpdates = results.filter(result => result.status === 'fulfilled').length;
        
        logger.info(`Successfully recalculated ${successfulUpdates} queue assignments`);
        toast.success(`คำนวณการมอบหมายคิวใหม่เรียบร้อย (${successfulUpdates} คิว)`);
        
        if (failedUpdates.length > 0) {
          toast.warning(`มีการอัปเดตบางรายการล้มเหลว (${failedUpdates.length} รายการ)`);
        }
      } else {
        logger.info('All queue assignments are already optimal');
        toast.info('การมอบหมายคิวทั้งหมดเหมาะสมแล้ว');
      }

      // Refresh queue data
      await fetchQueues();

    } catch (error) {
      logger.error('Error recalculating queues:', error);
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
      toast.error(`เกิดข้อผิดพลาดในการคำนวณคิวใหม่: ${errorMessage}`);
    }
  }, [mappings, fetchQueues]);

  return {
    recalculateAllQueues
  };
};
