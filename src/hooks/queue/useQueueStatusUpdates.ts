
import * as React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Queue, QueueStatus } from '@/integrations/supabase/schema';
import { toast } from 'sonner';

export const useQueueStatusUpdates = (
  updateQueueInState: (updatedQueue: Queue) => void
) => {
  const updateQueueStatus = React.useCallback(async (queueId: string, newStatus: QueueStatus) => {
    try {
      const now = new Date().toISOString();
      
      let updates: any = {
        status: newStatus,
        updated_at: now
      };
      
      // Add status-specific timestamp fields
      if (newStatus === 'ACTIVE') {
        updates.active_at = now;
      } else if (newStatus === 'COMPLETED') {
        updates.completed_at = now;
      } else if (newStatus === 'SKIPPED') {
        updates.skipped_at = now;
      } else if (newStatus === 'WAITING') {
        // Clear status-specific timestamps if setting back to WAITING
        updates.active_at = null;
        updates.completed_at = null;
        updates.skipped_at = null;
      }
      
      const { data, error } = await supabase
        .from('queues')
        .update(updates)
        .eq('id', queueId)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      if (data) {
        // Cast to ensure proper types
        const updatedQueue: Queue = {
          ...data,
          type: data.type as Queue['type'],
          status: data.status as QueueStatus
        };
        
        updateQueueInState(updatedQueue);
        
        // Show success toast with appropriate message
        const statusMessages = {
          ACTIVE: 'เรียกคิวเรียบร้อยแล้ว',
          COMPLETED: 'เสร็จสิ้นการให้บริการ',
          SKIPPED: 'ข้ามคิวเรียบร้อยแล้ว',
          WAITING: 'คืนสถานะเป็นรอดำเนินการ'
        };
        
        toast.success(statusMessages[newStatus] || 'อัปเดตสถานะคิวเรียบร้อยแล้ว');
        return updatedQueue;
      }
      
      return null;
    } catch (err: any) {
      console.error('Error updating queue status:', err);
      toast.error('ไม่สามารถอัปเดตสถานะคิวได้');
      return null;
    }
  }, [updateQueueInState]);

  return {
    updateQueueStatus
  };
};
