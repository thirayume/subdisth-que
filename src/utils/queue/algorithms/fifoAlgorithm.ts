
import { Queue } from '@/integrations/supabase/schema';
import { mapToQueueObject } from '../queueMapping';

// FIFO algorithm implementation
export const applyFifoAlgorithm = (waitingQueues: any[]): Queue | null => {
  return waitingQueues.length > 0 ?
    [...waitingQueues]
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map(mapToQueueObject)[0] || null
    : null;
};
