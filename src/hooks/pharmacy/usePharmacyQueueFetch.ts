
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

  // Transform raw data to ensure type safety
  const transformQueueData = React.useCallback((rawData: any[]): PharmacyQueue[] => {
    return rawData.map(q => {
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
  }, []);

  // Find active queue from the list of queues
  const findActiveServiceQueue = React.useCallback((queueList: PharmacyQueue[]): PharmacyQueue | null => {
    return queueList.find(q => q.service && q.service.status === 'IN_PROGRESS') || null;
  }, []);

  // Fetch queue data from Supabase
  const fetchQueueData = React.useCallback(async (todayDate: string) => {
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

    return result.data || [];
  }, []);

  // Process queue data after fetching
  const processQueueData = React.useCallback((queueData: any[]) => {
    logger.info(`Fetched ${queueData.length} pharmacy queues`);
    const typedQueues = transformQueueData(queueData);
    setQueues(typedQueues);
    
    // Set active queue if there's one already in service
    const inServiceQueue = findActiveServiceQueue(typedQueues);
    setActiveQueue(inServiceQueue);
    
    return typedQueues;
  }, [transformQueueData, findActiveServiceQueue]);

  // Main fetch function that orchestrates the fetch process
  const fetchPharmacyQueues = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      logger.info('Fetching pharmacy queues');

      // Get today's date in yyyy-mm-dd
      const todayDate = new Date().toISOString().slice(0, 10);
      
      // Fetch data from Supabase
      const pharmacyQueues = await fetchQueueData(todayDate);
      
      // Process the fetched data
      return processQueueData(pharmacyQueues);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch pharmacy queues';
      logger.error('Error fetching pharmacy queues:', err);
      setError(errorMessage);
      toast.error('ไม่สามารถดึงข้อมูลคิวเภสัชกรรมได้');
      return [];
    } finally {
      setLoading(false);
    }
  }, [fetchQueueData, processQueueData]);

  // Set up real-time subscription for pharmacy queues
  const setupRealtimeSubscription = React.useCallback(() => {
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

  // Initialize fetch and subscription
  React.useEffect(() => {
    fetchPharmacyQueues();
    return setupRealtimeSubscription();
  }, [fetchPharmacyQueues, setupRealtimeSubscription]);

  return {
    queues,
    activeQueue,
    setActiveQueue,
    loading,
    error,
    fetchPharmacyQueues
  };
};
