
import * as React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/logger';
import { queueSupabaseRequest } from '@/utils/requestThrottler';
import { PharmacyQueue, PharmacyService } from './types';
import { QueueStatus, QueueTypeEnum } from '@/integrations/supabase/schema';
import { toast } from 'sonner';

const logger = createLogger('usePharmacyQueueFetch');

export const usePharmacyQueueFetch = () => {
  const [queues, setQueues] = React.useState<PharmacyQueue[]>([]);
  const [activeQueue, setActiveQueue] = React.useState<PharmacyQueue | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch all active pharmacy queues for today
  const fetchPharmacyQueues = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      logger.info('Fetching pharmacy queues');

      // Get today's date in yyyy-mm-dd
      const todayDate = new Date().toISOString().slice(0, 10);

      const result = await queueSupabaseRequest(async () => {
        const response = await supabase
          .from('queues')
          .select(`
            *,
            patient:patients(*),
            service:pharmacy_queue_services(*)
          `)
          .eq('queue_date', todayDate)
          .eq('status', 'ACTIVE')
          .order('created_at', { ascending: true });
        
        return response;
      });

      if (result.error) {
        throw result.error;
      }

      const pharmacyQueues = result.data || [];
      logger.info(`Fetched ${pharmacyQueues.length} pharmacy queues`);
      
      // Transform the data to ensure type safety
      const typedQueues: PharmacyQueue[] = pharmacyQueues.map(q => {
        const queueService = q.service && q.service.length > 0 ? {
          ...q.service[0],
          status: q.service[0].status as 'IN_PROGRESS' | 'COMPLETED' | 'FORWARDED',
          pharmacist_notes: q.service[0].pharmacist_notes || null,
          forwarded_to: q.service[0].forwarded_to || null,
          service_end_at: q.service[0].service_end_at || null
        } : undefined;
        
        return {
          ...q,
          type: q.type as QueueTypeEnum,
          status: q.status as QueueStatus,
          service: queueService
        } as PharmacyQueue;
      });
      
      setQueues(typedQueues);
      
      // Set active queue if there's one already in service
      const inServiceQueue = typedQueues.find(q => 
        q.service && q.service.status === 'IN_PROGRESS'
      );
      
      if (inServiceQueue) {
        setActiveQueue(inServiceQueue);
      } else {
        setActiveQueue(null);
      }
      
      return typedQueues;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch pharmacy queues';
      logger.error('Error fetching pharmacy queues:', err);
      setError(errorMessage);
      toast.error('ไม่สามารถดึงข้อมูลคิวเภสัชกรรมได้');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Set up real-time subscription for pharmacy queues
  React.useEffect(() => {
    fetchPharmacyQueues();
    
    const channel = supabase
      .channel('pharmacy-queue-changes')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'queues' },
          () => {
            logger.debug('Queue change detected');
            fetchPharmacyQueues(); // Refresh all queues when changes occur
          }
      )
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'pharmacy_queue_services' },
          () => {
            logger.debug('Pharmacy service change detected');
            fetchPharmacyQueues(); // Refresh all queues when changes occur
          }
      )
      .subscribe();
      
    return () => {
      logger.debug('Unmounting pharmacy queue fetch hook, cleaning up subscription');
      supabase.removeChannel(channel);
    };
  }, [fetchPharmacyQueues]);

  return {
    queues,
    activeQueue,
    setActiveQueue,
    loading,
    error,
    fetchPharmacyQueues
  };
};
