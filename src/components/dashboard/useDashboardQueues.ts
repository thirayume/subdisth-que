
import * as React from 'react';
import { useQueues } from '@/hooks/useQueues';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useDashboardQueues');

export const useDashboardQueues = () => {
  logger.debug('Hook initialized');
  // Extract sortQueues and queues from the useQueues hook
  const queuesResult = useQueues();
  const queues = queuesResult?.queues || [];
  
  // Use refs to store the sortQueues function reference to prevent it from changing
  const sortQueuesRef = React.useRef(queuesResult?.sortQueues || ((q) => q));
  
  const [waitingQueues, setWaitingQueues] = React.useState([]);
  const [activeQueues, setActiveQueues] = React.useState([]);
  const [completedQueues, setCompletedQueues] = React.useState([]);

  // Create a stable sortQueues function that won't change on re-renders
  const memoizedSortQueues = React.useCallback(
    (queues) => {
      // Use the stored reference to ensure stability
      return sortQueuesRef.current(queues);
    },
    [sortQueuesRef]
  );

  // Update state once when queues change
  React.useEffect(() => {
    logger.debug('Queues updated, filtering by status');
    if (queues && Array.isArray(queues)) {
      const waiting = queues.filter(q => q.status === 'WAITING');
      const active = queues.filter(q => q.status === 'ACTIVE');
      const completed = queues.filter(q => q.status === 'COMPLETED');

      // Set all states in a single batch to reduce renders
      setWaitingQueues(memoizedSortQueues(waiting));
      setActiveQueues(active);
      setCompletedQueues(completed);
      
      logger.info(`Filtered queues - Waiting: ${waiting.length}, Active: ${active.length}, Completed: ${completed.length}`);
    }
    // Include queues and memoizedSortQueues as dependencies to ensure updates when they change
  }, [queues, memoizedSortQueues]);

  return {
    waitingQueues,
    activeQueues,
    completedQueues
  };
};
