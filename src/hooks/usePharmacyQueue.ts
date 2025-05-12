
import * as React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/logger';
import { queueSupabaseRequest } from '@/utils/requestThrottler';
import { Queue, Patient } from '@/integrations/supabase/schema';
import { toast } from 'sonner';

const logger = createLogger('usePharmacyQueue');

export interface PharmacyService {
  id: string;
  queue_id: string;
  pharmacist_notes?: string;
  service_start_at: string;
  service_end_at?: string;
  forwarded_to?: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'FORWARDED';
  created_at: string;
  updated_at: string;
}

export interface PharmacyQueue extends Queue {
  patient?: Patient;
  service?: PharmacyService;
}

export const usePharmacyQueue = () => {
  const [queues, setQueues] = React.useState<PharmacyQueue[]>([]);
  const [activeQueue, setActiveQueue] = React.useState<PharmacyQueue | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [loadingNext, setLoadingNext] = React.useState(false);
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
          status: q.service[0].status as 'IN_PROGRESS' | 'COMPLETED' | 'FORWARDED'
        } : undefined;
        
        return {
          ...q,
          service: queueService
        };
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
        status: serviceData.status as 'IN_PROGRESS' | 'COMPLETED' | 'FORWARDED'
      } : undefined;

      const newActiveQueue = {
        ...activatedQueue,
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

  // Complete pharmacy service
  const completeService = async (queueId: string, notes?: string) => {
    try {
      setError(null);
      logger.info(`Completing pharmacy service for queue ${queueId}`);

      if (!activeQueue || activeQueue.id !== queueId) {
        toast.error('ไม่พบข้อมูลคิวที่กำลังให้บริการ');
        return false;
      }

      const serviceId = activeQueue.service?.id;
      if (!serviceId) {
        toast.error('ไม่พบข้อมูลการให้บริการ');
        return false;
      }

      // Update the pharmacy service
      const serviceResult = await queueSupabaseRequest(async () => {
        return await supabase
          .from('pharmacy_queue_services')
          .update({
            status: 'COMPLETED', 
            service_end_at: new Date().toISOString(),
            pharmacist_notes: notes
          })
          .eq('id', serviceId)
          .select();
      });

      if (serviceResult.error) {
        throw serviceResult.error;
      }

      // Update the queue status
      const queueResult = await queueSupabaseRequest(async () => {
        return await supabase
          .from('queues')
          .update({ 
            status: 'COMPLETED',
            completed_at: new Date().toISOString(),
            pharmacy_status: 'COMPLETED'
          })
          .eq('id', queueId)
          .select();
      });

      if (queueResult.error) {
        throw queueResult.error;
      }

      setActiveQueue(null);
      await fetchPharmacyQueues(); // Refresh all queues
      
      toast.success('ให้บริการเสร็จสิ้น');
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete service';
      logger.error('Error completing pharmacy service:', err);
      setError(errorMessage);
      toast.error('ไม่สามารถบันทึกการให้บริการได้');
      return false;
    }
  };

  // Forward to another service
  const forwardService = async (queueId: string, forwardTo: string, notes?: string) => {
    try {
      setError(null);
      logger.info(`Forwarding queue ${queueId} to ${forwardTo}`);

      if (!activeQueue || activeQueue.id !== queueId) {
        toast.error('ไม่พบข้อมูลคิวที่กำลังให้บริการ');
        return false;
      }

      const serviceId = activeQueue.service?.id;
      if (!serviceId) {
        toast.error('ไม่พบข้อมูลการให้บริการ');
        return false;
      }

      // Update the pharmacy service
      const serviceResult = await queueSupabaseRequest(async () => {
        return await supabase
          .from('pharmacy_queue_services')
          .update({
            status: 'FORWARDED', 
            service_end_at: new Date().toISOString(),
            forwarded_to: forwardTo,
            pharmacist_notes: notes
          })
          .eq('id', serviceId)
          .select();
      });

      if (serviceResult.error) {
        throw serviceResult.error;
      }

      // Keep queue active but update pharmacy status
      const queueResult = await queueSupabaseRequest(async () => {
        return await supabase
          .from('queues')
          .update({ 
            pharmacy_status: 'FORWARDED'
          })
          .eq('id', queueId)
          .select();
      });

      if (queueResult.error) {
        throw queueResult.error;
      }

      setActiveQueue(null);
      await fetchPharmacyQueues(); // Refresh all queues
      
      toast.success(`ส่งต่อไปยัง ${forwardTo} เรียบร้อยแล้ว`);
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to forward service';
      logger.error('Error forwarding pharmacy service:', err);
      setError(errorMessage);
      toast.error('ไม่สามารถบันทึกการส่งต่อได้');
      return false;
    }
  };

  // Initial fetch
  React.useEffect(() => {
    fetchPharmacyQueues();
    
    // Set up real-time subscription for pharmacy queues
    const channel = supabase
      .channel('pharmacy-queue-changes')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'queues' },
          (payload) => {
            logger.debug('Queue change detected:', payload);
            fetchPharmacyQueues(); // Refresh all queues when changes occur
          }
      )
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'pharmacy_queue_services' },
          (payload) => {
            logger.debug('Pharmacy service change detected:', payload);
            fetchPharmacyQueues(); // Refresh all queues when changes occur
          }
      )
      .subscribe();
      
    return () => {
      logger.debug('Unmounting pharmacy queue hook, cleaning up subscription');
      supabase.removeChannel(channel);
    };
  }, [fetchPharmacyQueues]);

  return {
    queues,
    activeQueue,
    loading,
    loadingNext,
    error,
    fetchPharmacyQueues,
    callNextQueue,
    completeService,
    forwardService
  };
};
