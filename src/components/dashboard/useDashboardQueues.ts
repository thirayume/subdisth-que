
import * as React from 'react';
import { useQueues } from '@/hooks/useQueues';
import { createLogger } from '@/utils/logger';
import { Queue, QueueStatus } from '@/integrations/supabase/schema';
import { debounce } from '@/utils/performanceOptimizations';

const logger = createLogger('useDashboardQueues');

export const useDashboardQueues = () => {
  logger.debug('Hook initialized');
  
  // Get queues data from the useQueues hook
  const { queues = [], sortQueues: originalSortQueues } = useQueues() || {};
  
  // Initialize state for different queue statuses
  const [queuesByStatus, setQueuesByStatus] = React.useState<{
    waiting: Queue[];
    active: Queue[];
    completed: Queue[];
  }>({
    waiting: [],
    active: [],
    completed: []
  });

  // Memoize the sorting function to maintain referential equality
  const memoizedSortQueues = React.useCallback(
    (queues: Queue[]) => {
      if (!originalSortQueues) return queues;
      return originalSortQueues(queues);
    },
    [originalSortQueues]
  );

  // Debounce the filter operation for better performance
  const debouncedFilterQueues = React.useCallback(
    debounce((currentQueues: Queue[]) => {
      if (!Array.isArray(currentQueues)) return;
      
      // Filter queues by status
      const waiting = currentQueues.filter(q => q.status === 'WAITING');
      const active = currentQueues.filter(q => q.status === 'ACTIVE');
      const completed = currentQueues.filter(q => q.status === 'COMPLETED');
      
      // Apply sorting only to waiting queues (most important for queue order)
      const sortedWaiting = memoizedSortQueues(waiting);
      
      // Update the state in a single operation to reduce renders
      setQueuesByStatus({
        waiting: sortedWaiting,
        active,
        completed
      });
      
      logger.info(`Filtered queues - Waiting: ${waiting.length}, Active: ${active.length}, Completed: ${completed.length}`);
    }, 100),
    [memoizedSortQueues]
  );

  // Use a separate effect to process queues when they change
  React.useEffect(() => {
    logger.debug('Queues updated, preparing to filter by status');
    debouncedFilterQueues(queues);
  }, [queues, debouncedFilterQueues]);

  // Return the categorized queues
  return {
    waitingQueues: queuesByStatus.waiting,
    activeQueues: queuesByStatus.active,
    completedQueues: queuesByStatus.completed
  };
};
