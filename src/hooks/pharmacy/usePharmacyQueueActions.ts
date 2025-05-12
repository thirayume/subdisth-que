
import * as React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/logger';
import { queueSupabaseRequest } from '@/utils/requestThrottler';
import { PharmacyQueue } from './types';
import { QueueStatus, QueueTypeEnum } from '@/integrations/supabase/schema';
import { toast } from 'sonner';

const logger = createLogger('usePharmacyQueueActions');

interface UsePharmacyQueueActionsProps {
  activeQueue: PharmacyQueue | null;
  setActiveQueue: (queue: PharmacyQueue | null) => void;
  fetchPharmacyQueues: () => Promise<PharmacyQueue[]>;
}

export const usePharmacyQueueActions = ({
  activeQueue,
  setActiveQueue,
  fetchPharmacyQueues
}: UsePharmacyQueueActionsProps) => {
  const [loadingNext, setLoadingNext] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Call next queue
  const callNextQueue = async () => {
    try {
      if (activeQueue) {
        toast.warning('กรุณาดำเนินการกับคิวปัจจุบันให้เสร็จก่อน');
        return null;
      }

      setLoadingNext(true);
      setError(null);
      logger.info('Fetching next waiting queue');

      // Get today's date in yyyy-mm-dd
      const todayDate = new Date().toISOString().slice(0, 10);

      // Get the next waiting queue
      const waitingResult = await queueSupabaseRequest(async () => {
        return await supabase
          .from('queues')
          .select(`
            *,
            patient:patients(*)
          `)
          .eq('queue_date', todayDate)
          .eq('status', 'WAITING')
          .order('created_at', { ascending: true })
          .limit(1);
      });

      if (waitingResult.error) {
        throw waitingResult.error;
      }

      if (!waitingResult.data || waitingResult.data.length === 0) {
        toast.info('ไม่มีคิวที่รอดำเนินการ');
        return null;
      }

      const nextQueue = waitingResult.data[0];
      
      // Update the queue status to ACTIVE
      const updateResult = await queueSupabaseRequest(async () => {
        return await supabase
          .from('queues')
          .update({ status: 'ACTIVE', called_at: new Date().toISOString() })
          .eq('id', nextQueue.id)
          .select(`
            *,
            patient:patients(*)
          `);
      });

      if (updateResult.error) {
        throw updateResult.error;
      }

      if (!updateResult.data || updateResult.data.length === 0) {
        throw new Error('Failed to update queue status');
      }

      const activatedQueue = updateResult.data[0];
      
      // Create a pharmacy service record
      const serviceResult = await queueSupabaseRequest(async () => {
        return await supabase
          .from('pharmacy_queue_services')
          .insert({
            queue_id: activatedQueue.id,
            status: 'IN_PROGRESS',
            service_start_at: new Date().toISOString()
          })
          .select();
      });

      if (serviceResult.error) {
        throw serviceResult.error;
      }

      const serviceData = serviceResult.data && serviceResult.data.length > 0 
        ? serviceResult.data[0] 
        : undefined;

      // Ensure the service status is correctly typed
      const service = serviceData ? {
        ...serviceData,
        status: serviceData.status as 'IN_PROGRESS' | 'COMPLETED' | 'FORWARDED',
        pharmacist_notes: serviceData.pharmacist_notes || null,
        forwarded_to: serviceData.forwarded_to || null,
        service_end_at: serviceData.service_end_at || null
      } : undefined;

      const newActiveQueue: PharmacyQueue = {
        ...activatedQueue,
        type: activatedQueue.type as QueueTypeEnum,
        status: activatedQueue.status as QueueStatus,
        service
      };

      setActiveQueue(newActiveQueue);
      await fetchPharmacyQueues(); // Refresh all queues
      
      toast.success(`เรียกคิวหมายเลข ${newActiveQueue.number} เข้ารับบริการ`);
      return newActiveQueue;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to call next queue';
      logger.error('Error calling next queue:', err);
      setError(errorMessage);
      toast.error('ไม่สามารถเรียกคิวถัดไปได้');
      return null;
    } finally {
      setLoadingNext(false);
    }
  };

  return {
    loadingNext,
    error,
    callNextQueue
  };
};
