
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Queue, QueueStatus, QueueType } from '@/integrations/supabase/schema';
import { toast } from 'sonner';

// Add debug logging
console.log("[DEBUG] useQueueStatusUpdates importing React:", React);

export const useQueueStatusUpdates = (updateQueues: (newQueue: Queue) => void) => {
  const [error, setError] = useState<string | null>(null);
  
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
        
        updateQueues(updatedQueue);
        
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

  return {
    error,
    updateQueueStatus
  };
};
