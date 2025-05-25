
import * as React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { queueSupabaseRequest } from '@/utils/requestThrottler';
import { PharmacyQueue } from '../types';
import { QueueStatus, QueueTypeEnum } from '@/integrations/supabase/schema';
import { usePharmacyErrorHandler } from './usePharmacyErrorHandler';

export const usePharmacyDataFetch = () => {
  const { withErrorHandling } = usePharmacyErrorHandler();

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

  const fetchPharmacyQueues = React.useCallback(
    withErrorHandling(async (): Promise<PharmacyQueue[]> => {
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

      return transformQueueData(result.data || []);
    }, 'FETCH_ERROR', { operation: 'fetchPharmacyQueues' }),
    [transformQueueData, withErrorHandling]
  );

  const findActiveServiceQueue = React.useCallback((queueList: PharmacyQueue[]): PharmacyQueue | null => {
    return queueList.find(q => q.service && q.service.status === 'IN_PROGRESS') || null;
  }, []);

  return {
    fetchPharmacyQueues,
    findActiveServiceQueue,
    transformQueueData
  };
};
