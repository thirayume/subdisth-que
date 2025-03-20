
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Queue, QueueStatus, QueueType } from '@/integrations/supabase/schema';
import { toast } from 'sonner';

export const useQueues = () => {
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
    } catch (err: any) {
      console.error('Error fetching queues:', err);
      setError(err.message || 'Failed to fetch queues');
      toast.error('ไม่สามารถดึงข้อมูลคิวได้');
    } finally {
      setLoading(false);
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

  // Update queue status
  const updateQueueStatus = async (id: string, status: QueueStatus) => {
    try {
      setError(null);
      
      const updates: Partial<Queue> = { status, updated_at: new Date().toISOString() };
      
      // Add timestamps based on status
      if (status === 'ACTIVE') {
        updates.called_at = new Date().toISOString();
      } else if (status === 'COMPLETED') {
        updates.completed_at = new Date().toISOString();
      }
      
      const { data, error } = await supabase
        .from('queues')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        // Cast the returned data to ensure proper type conversion
        const updatedQueue: Queue = {
          ...data[0],
          type: data[0].type as QueueType,
          status: data[0].status as QueueStatus
        };
        
        setQueues(prev => prev.map(queue => 
          queue.id === id ? updatedQueue : queue
        ));
        
        let statusMessage = 'อัปเดตสถานะคิวเรียบร้อยแล้ว';
        if (status === 'ACTIVE') statusMessage = 'เรียกคิวเรียบร้อยแล้ว';
        else if (status === 'COMPLETED') statusMessage = 'คิวเสร็จสิ้นเรียบร้อยแล้ว';
        else if (status === 'SKIPPED') statusMessage = 'ข้ามคิวเรียบร้อยแล้ว';
        
        toast.success(statusMessage);
        return updatedQueue;
      }
    } catch (err: any) {
      console.error('Error updating queue status:', err);
      setError(err.message || 'Failed to update queue status');
      toast.error('ไม่สามารถอัปเดตสถานะคิวได้');
      return null;
    }
  };
  
  // Get queues by status
  const getQueuesByStatus = async (status: QueueStatus | QueueStatus[]) => {
    try {
      setLoading(true);
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
      return (data || []).map(item => ({
        ...item,
        type: item.type as QueueType,
        status: item.status as QueueStatus
      }));
    } catch (err: any) {
      console.error('Error fetching queues by status:', err);
      setError(err.message || 'Failed to fetch queues');
      toast.error('ไม่สามารถดึงข้อมูลคิวได้');
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  // Call a queue
  const callQueue = async (id: string) => {
    return updateQueueStatus(id, 'ACTIVE');
  };
  
  // Initial data fetch
  useEffect(() => {
    fetchQueues();
  }, []);

  return {
    queues,
    loading,
    error,
    fetchQueues,
    addQueue,
    updateQueueStatus,
    getQueuesByStatus,
    callQueue,
  };
};
