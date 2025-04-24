
import * as React from 'react';
import { Queue } from '@/integrations/supabase/schema';

export const useQueueMetrics = (completedQueues: Queue[]) => {
  // Calculate metrics from real data
  const averageWaitTime = completedQueues.length > 0 
    ? completedQueues.reduce((sum, queue) => {
        if (queue.called_at && queue.created_at) {
          const waitMs = new Date(queue.called_at).getTime() - new Date(queue.created_at).getTime();
          return sum + (waitMs / 60000);
        }
        return sum;
      }, 0) / completedQueues.length
    : 0;
    
  const averageServiceTime = completedQueues.length > 0 
    ? completedQueues.reduce((sum, queue) => {
        if (queue.completed_at && queue.called_at) {
          const serviceMs = new Date(queue.completed_at).getTime() - new Date(queue.called_at).getTime();
          return sum + (serviceMs / 60000);
        }
        return sum;
      }, 0) / completedQueues.length
    : 0;
  
  return {
    averageWaitTime,
    averageServiceTime
  };
};
