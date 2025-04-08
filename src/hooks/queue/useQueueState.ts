
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Queue, QueueStatus, QueueType } from '@/integrations/supabase/schema';
import { toast } from 'sonner';

export const useQueueState = () => {
  const [queues, setQueues] = useState<Queue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all queues
  const fetchQueues = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('queues')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Cast the data to ensure proper type conversion
      setQueues((data || []).map(item => ({
        ...item,
        type: item.type as QueueType,
        status: item.status as QueueStatus
      })));
      
      console.log(`Fetched ${data?.length || 0} queues from database`);
    } catch (err: any) {
      console.error('Error fetching queues:', err);
      setError(err.message || 'Failed to fetch queues');
      toast.error('ไม่สามารถดึงข้อมูลคิวได้');
    } finally {
      setLoading(false);
    }
  };

  // Get queues by status
  const getQueuesByStatus = async (status: QueueStatus | QueueStatus[]) => {
    try {
      setError(null);
      
      let query = supabase
        .from('queues')
        .select('*');
        
      if (Array.isArray(status)) {
        query = query.in('status', status);
      } else {
        query = query.eq('status', status);
      }
      
      const { data, error } = await query.order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      // Cast the data to ensure proper type conversion
      const typedData = (data || []).map(item => ({
        ...item,
        type: item.type as QueueType,
        status: item.status as QueueStatus
      }));
      
      console.log(`Fetched ${typedData.length} queues with status ${Array.isArray(status) ? status.join(', ') : status}`);
      
      return typedData;
    } catch (err: any) {
      console.error('Error fetching queues by status:', err);
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
        throw error;
      }

      if (data && data.length > 0) {
        // Cast the returned data to ensure proper type conversion
        const newQueue: Queue = {
          ...data[0],
          type: data[0].type as QueueType,
          status: data[0].status as QueueStatus
        };
        
        setQueues(prev => [newQueue, ...prev]);
        toast.success(`เพิ่มคิวหมายเลข ${queueData.number} เรียบร้อยแล้ว`);
        return newQueue;
      }
    } catch (err: any) {
      console.error('Error adding queue:', err);
      setError(err.message || 'Failed to add queue');
      toast.error('ไม่สามารถเพิ่มคิวได้');
      return null;
    }
  };

  // Update a queue in state
  const updateQueueInState = useCallback((updatedQueue: Queue) => {
    setQueues(prevQueues => 
      prevQueues.map(queue => queue.id === updatedQueue.id ? updatedQueue : queue)
    );
  }, []);

  // Initial data fetch and set up real-time subscription
  useEffect(() => {
    fetchQueues();
    
    // Set up real-time subscription for queues
    const channel = supabase
      .channel('queue-state-changes')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'queues' },
          (payload) => {
            console.log('Queue state change detected:', payload);
            fetchQueues(); // Refresh all queues when changes occur
          }
      )
      .subscribe();
      
    return () => {
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
