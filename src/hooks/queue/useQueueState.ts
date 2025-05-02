
import * as React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Queue, QueueStatus, QueueType } from '@/integrations/supabase/schema';
import { toast } from 'sonner';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useQueueState');

export const useQueueState = () => {
  const [queues, setQueues] = React.useState<Queue[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Helper: Get today's date in yyyy-mm-dd
  const getTodayDate = () => new Date().toISOString().slice(0,10);

  // Fetch all queues for today
  const fetchQueues = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('queues')
        .select('*')
        .eq('queue_date', getTodayDate())
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setQueues((data || []).map(item => ({
        ...item,
        type: item.type as QueueType,
        status: item.status as QueueStatus
      })));
      
      logger.info(`Fetched ${data?.length || 0} queues for ${getTodayDate()} from database`);
    } catch (err: any) {
      logger.error('Error fetching queues:', err);
      setError(err.message || 'Failed to fetch queues');
      toast.error('ไม่สามารถดึงข้อมูลคิวได้');
    } finally {
      setLoading(false);
    }
  };

  // Get queues by status for today
  const getQueuesByStatus = async (status: QueueStatus | QueueStatus[]) => {
    try {
      setError(null);

      let query = supabase
        .from('queues')
        .select('*')
        .eq('queue_date', getTodayDate());
        
      if (Array.isArray(status)) {
        query = query.in('status', status);
      } else {
        query = query.eq('status', status);
      }

      const { data, error } = await query.order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      const typedData = (data || []).map(item => ({
        ...item,
        type: item.type as QueueType,
        status: item.status as QueueStatus
      }));
      
      logger.info(
        `Fetched ${typedData.length} queues for ${getTodayDate()} with status ${Array.isArray(status) ? status.join(', ') : status}`
      );
      
      return typedData;
    } catch (err: any) {
      logger.error('Error fetching queues by status:', err);
      setError(err.message || 'Failed to fetch queues');
      toast.error('ไม่สามารถดึงข้อมูลคิวได้');
      return [];
    }
  };

  // Add a new queue
  const addQueue = async (queueData: Partial<Queue>) => {
    try {
      setError(null);
      
      if (!queueData.patient_id || !queueData.number || !queueData.type) {
        throw new Error('Missing required queue data');
      }
      
      logger.info('Adding queue:', queueData);
      
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
        logger.error('Error in supabase insert:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        logger.error('No queue returned from insert');
        throw new Error('No queue data returned from insert');
      }
      
      logger.info('Queue added successfully:', data[0]);
      
      // Cast the returned data to ensure proper type conversion
      const newQueue: Queue = {
        ...data[0],
        type: data[0].type as QueueType,
        status: data[0].status as QueueStatus
      };
      
      setQueues(prev => [newQueue, ...prev]);
      toast.success(`เพิ่มคิวหมายเลข ${queueData.number} เรียบร้อยแล้ว`);
      return newQueue;
    } catch (err: any) {
      logger.error('Error adding queue:', err);
      setError(err.message || 'Failed to add queue');
      toast.error('ไม่สามารถเพิ่มคิวได้');
      return null;
    }
  };

  // Update a queue in state
  const updateQueueInState = React.useCallback((updatedQueue: Queue) => {
    setQueues(prevQueues => 
      prevQueues.map(queue => queue.id === updatedQueue.id ? updatedQueue : queue)
    );
  }, []);

  // Initial data fetch and set up real-time subscription
  React.useEffect(() => {
    logger.info('Initial mount, fetching queues');
    fetchQueues();
    
    // Set up real-time subscription for queues
    const channel = supabase
      .channel('queue-state-changes')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'queues' },
          (payload) => {
            logger.debug('Queue change detected:', payload);
            fetchQueues(); // Refresh all queues when changes occur
          }
      )
      .subscribe();
      
    return () => {
      logger.debug('Unmounting, cleaning up subscription');
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    queues,
    loading,
    error,
    fetchQueues,
    addQueue,
    getQueuesByStatus,
    updateQueueInState
  };
};
