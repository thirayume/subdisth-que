
import * as React from 'react';
import { useQueues } from '@/hooks/useQueues';
import { createLogger } from '@/utils/logger';
import { Queue } from '@/integrations/supabase/schema';

const logger = createLogger('useDashboardQueues');

export const useDashboardQueues = () => {
  logger.debug('Hook initialized');
  
  // Get queues data from the useQueues hook
  const { queues = [], sortQueues } = useQueues() || {};
  
  // Initialize state for different queue statuses
  const [queuesByStatus, setQueuesByStatus] = React.useState<{
    waiting: Queue[];
    active: Queue[];
    completed: Queue[];
    skipped: Queue[];
  }>({
    waiting: [],
    active: [],
    completed: [],
    skipped: []
  });
  
  // Memoize the filter and sort operation to avoid unnecessary recalculations
  const processQueues = React.useCallback(() => {
    if (!Array.isArray(queues)) return;
    
    // Filter queues by status
    const waiting = queues.filter(q => q.status === 'WAITING');
    const active = queues.filter(q => q.status === 'ACTIVE');
    const completed = queues.filter(q => q.status === 'COMPLETED');
    const skipped = queues.filter(q => q.status === 'SKIPPED');
    
    // Only apply sorting to waiting queues for efficiency
    const sortedWaiting = sortQueues ? sortQueues(waiting) : waiting;
    
    return {
      waiting: sortedWaiting,
      active,
      completed,
      skipped
    };
  }, [queues, sortQueues]);
  
  // Update state when queues change or sort function changes
  React.useEffect(() => {
    const processedQueues = processQueues();
    
    if (processedQueues) {
      setQueuesByStatus(processedQueues);
      
      logger.info(
        `Processed queues - Waiting: ${processedQueues.waiting.length}, ` +
        `Active: ${processedQueues.active.length}, ` +
        `Completed: ${processedQueues.completed.length}, ` +
        `Skipped: ${processedQueues.skipped.length}`
      );
    }
  }, [processQueues]);

  return {
    waitingQueues: queuesByStatus.waiting,
    activeQueues: queuesByStatus.active,
    completedQueues: queuesByStatus.completed,
    skippedQueues: queuesByStatus.skipped
  };
};
